import { test, APIRequestContext, expect } from "@playwright/test";
import { createWallet } from "@apps/client-api/repositories/tronweb";
import { log } from "@shared/utils/logger";
import { SmartOrderFieldCheck } from "@apps/client-api/test-objects/smart-order-field-check";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { SmartOrderResponseCheck } from "@apps/client-api/test-objects/smart-order-response-check";
import { AddressCheck } from "@apps/client-api/test-objects/address-check";
import { SmartOrderApi } from "@apps/client-api/api/smart-order.api";
import { SmartOrderRepository } from "@apps/client-api/repositories/smart-order.repository";
import { OrderApi } from "@apps/client-api/api/order.api";
import { apiKeyZero } from "@apps/client-api/api/constants";
import { SmartOrderWithOrders, CreateActivationOrderRequest, Order } from "@shared/utils/types";
import { HttpStatus } from "@shared/utils/constants";
import { invalidCreateSmartOrderRequestVariations } from "@shared/utils/variations_constants/invalid-create-smart-order-request-variations";
import { invalidSmartOrderExtraFieldsVariations } from "@shared/utils/variations_constants/invalid-smart-order-extra-fields-variations";
import { WalletActivationHelper } from "@shared/helpers/wallet-activation-helper";
import { PriceCheck } from "@apps/client-api/test-objects/price-check";
import { CoreRepository } from "@apps/client-api/api/core.api";
import { OrderPeriod } from "@shared/utils/constants";
import { EnergyOrderPeriodMs, BandwidthOrderPeriodMs } from "@shared/utils/types";

test.describe("Create new smart order POST /api/v2/smart-orders/", () => {
  const smartOrderFieldCheck = new SmartOrderFieldCheck();
  const smartOrderResponseCheck = new SmartOrderResponseCheck();
  const statusCheck = new ResponseStatusCheck();
  const smartOrderRepo = new SmartOrderRepository();
  const addressCheck = new AddressCheck();
  const priceCheck = new PriceCheck();
  const walletActivationHelper = new WalletActivationHelper();

  async function createAndActivateFromAddress(
    request: APIRequestContext,
    timeoutMs = 30000,
    stepMs = 1000
  ): Promise<string> {
    const wallet = await createWallet();
    const fromAddress = wallet.address?.base58 || "";
    log.info(`Создан кошелек fromAddress: ${fromAddress}`);

    const orderApi = new OrderApi(request);
    const activationRequest: CreateActivationOrderRequest = {
      type: "ACTIVATION",
      targetAddress: fromAddress,
    };

    const activationResponse = await orderApi.createNewOrder({ data: activationRequest });
    const activationStatus = activationResponse.status();
    log.info(`API запрос (ACTIVATION) выполнен. Статус: ${activationStatus}`);
    statusCheck.checkResponseStatus(activationResponse);

    const activationOrder = (await activationResponse.json()) as Order;
    log.info(`API Response (ACTIVATION): ${JSON.stringify(activationOrder, null, 2)}`);

    await walletActivationHelper.waitForActivationCompleted({
      orderId: activationOrder.id,
      targetAddress: fromAddress,
      timeoutMs,
      stepMs,
    });
    log.info(`Кошелек fromAddress активирован: ${fromAddress}`);

    return fromAddress;
  }


  async function waitForSmartOrderCompleted(
    smartOrderId: number,
    timeoutMs = 90000,
    stepMs = 1000
  ) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const dbRows = await smartOrderRepo.getSmartOrderById(smartOrderId);
      const dbSmartOrder = dbRows[0] as any;

      const status = dbSmartOrder?.status;
      if (status === "FAILED") {
        log.info(`Smart Order в БД завершился FAILED (smartOrderId=${smartOrderId})`);
        throw new Error(
          `Smart Order smartOrderId=${smartOrderId} завершился FAILED. DB: ${JSON.stringify(dbSmartOrder, null, 2)}`
        );
      }

      if (status === "COMPLETED") {
        log.info(`Smart Order в БД завершился COMPLETED (smartOrderId=${smartOrderId})`);
        return dbSmartOrder;
      }

      log.info(
        `Smart Order smartOrderId=${smartOrderId} ещё не в финальном статусе, статус=${status ?? "none"}`
      );
      await new Promise((r) => setTimeout(r, stepMs));
    }

    throw new Error(
      `Smart Order smartOrderId=${smartOrderId} не перешёл в COMPLETED за ${timeoutMs} мс`
    );
  }

  test("Тест-кейс № 1: Проверка создания нового smart order и валидации полей ответа", async ({ request }) => {
    log.info("=== Тест: Создание нового smart order ===");

    const smartOrderApi = new SmartOrderApi(request);

    const fromAddress = await createAndActivateFromAddress(request);

    const toWallet = await createWallet();
    const toAddress = toWallet.address?.base58 || "";
    log.info(
      `Создан кошелек toAddress (на него будет делегироваться энергия и bandwidth): ${toAddress}`
    );

    addressCheck.validateAddresses(fromAddress, toAddress);

    const smartOrderRequest = {
      fromAddress,
      toAddress,
      withActivation: true,
      withEnergy: true,
      withBandwidth: true,
    };

    log.info(
      `Отправка запроса на создание smart order: ${JSON.stringify(smartOrderRequest, null, 2)}`
    );

    const response = await smartOrderApi.createNewSmartOrder({ data: smartOrderRequest });
    const responseStatus = response.status();
    log.info(`API запрос выполнен. Статус: ${responseStatus}`);

    statusCheck.checkResponseStatus(response);

    const apiSmartOrder = (await response.json()) as SmartOrderWithOrders;
    log.info(`API Response: ${JSON.stringify(apiSmartOrder, null, 2)}`);

    log.info("Проверка обязательных полей и их типов...");
    smartOrderFieldCheck.checkAllFields(apiSmartOrder);

    smartOrderFieldCheck.checkRequestResponseMatch(
      apiSmartOrder,
      fromAddress,
      toAddress,
      true,
      true,
      true
    );

    const dbFinalSmartOrder = await waitForSmartOrderCompleted(apiSmartOrder.id);

    const getSmartOrderResponse = await smartOrderApi.getSmartOrderById({ smartOrderId: apiSmartOrder.id });
    statusCheck.checkResponseStatus(getSmartOrderResponse);
    const apiFinalSmartOrder = (await getSmartOrderResponse.json()) as SmartOrderWithOrders;
    log.info(`API Response (Smart Order, by id): ${JSON.stringify(apiFinalSmartOrder, null, 2)}`);
    log.info(
      `Финальный статус smart order по API: ${apiFinalSmartOrder.status} (smartOrderId=${apiFinalSmartOrder.id})`
    );

    smartOrderFieldCheck.checkAllFields(apiFinalSmartOrder);
    smartOrderResponseCheck.checkSmartOrderFieldEquality(apiFinalSmartOrder, dbFinalSmartOrder);

    log.info("Проверка цен заказов в финальном smart order по формулам...");
    const coreRepo = new CoreRepository();
    for (const order of apiFinalSmartOrder.orders) {
      if (order.type === "ENERGY" && order.amount && order.period) {
        await priceCheck.checkEnergyOrderPriceByFormula(
          order,
          coreRepo,
          order.period as EnergyOrderPeriodMs,
          order.amount,
          0.01
        );
      } else if (order.type === "BANDWIDTH" && order.amount && order.period) {
        await priceCheck.checkBandwidthOrderPriceByFormula(
          order,
          coreRepo,
          order.period as BandwidthOrderPeriodMs,
          order.amount,
          0.03
        );
      } else if (order.type === "ACTIVATION") {
        const activationPrice =
          typeof order.sellPrice === "string" ? parseFloat(order.sellPrice) : order.sellPrice;
        log.info(`Проверка цены активации: ${activationPrice} TRX`);
        expect(activationPrice, "Стоимость заказа ACTIVATION должна быть больше нуля").toBeGreaterThan(0);
      }
    }

    log.info("✓ Все проверки полей ответа после создания smart order пройдены");
  });

  // Тест-кейс № 2: Проверка невалидных значений в запросе
  test.describe("Тест-кейс № 2: Проверка отклонения невалидных значений в запросе", () => {
    for (const variation of invalidCreateSmartOrderRequestVariations) {
      test(`${variation.description}`, async ({ request }) => {
        const smartOrderApi = new SmartOrderApi(request);

        const response = await smartOrderApi.createNewSmartOrder({ data: variation.data });
        statusCheck.checkResponseStatus(response, HttpStatus.BAD_REQUEST);

        const headers = response.headers();
        const contentType = headers["content-type"] ?? headers["Content-Type"] ?? "";

        if (contentType.includes("application/json")) {
          const jsonBody = await response.json().catch(() => undefined);
          log.info(`Error response JSON: ${JSON.stringify(jsonBody, null, 2)}`);
        } else {
          const textBody = await response.text().catch(() => "");
          log.info(`Error response text: ${textBody}`);
        }
      });
    }
  });

  // Тест-кейс № 3: Проверка игнорирования лишних полей в запросе
  test.describe("Тест-кейс № 3: Проверка игнорирования лишних полей в запросе", () => {
    for (const variation of invalidSmartOrderExtraFieldsVariations) {
      test(`${variation.description}`, async ({ request }) => {
        const smartOrderApi = new SmartOrderApi(request);

        const fromAddress = await createAndActivateFromAddress(request);
        const toWallet = await createWallet();
        const toAddress = toWallet.address?.base58 || "";

        const requestData = {
          ...variation.data,
          fromAddress,
          toAddress,
        };

        const response = await smartOrderApi.createNewSmartOrder({ data: requestData });
        statusCheck.checkResponseStatus(response, HttpStatus.OK);

        const apiSmartOrder = (await response.json()) as SmartOrderWithOrders;
        log.info(`API Response (with extra fields): ${JSON.stringify(apiSmartOrder, null, 2)}`);

        smartOrderFieldCheck.checkAllFields(apiSmartOrder);
        smartOrderFieldCheck.checkRequestResponseMatch(
          apiSmartOrder,
          fromAddress,
          toAddress,
          requestData.withActivation ?? true,
          requestData.withEnergy ?? true,
          requestData.withBandwidth ?? true
        );

        log.info(`✓ Smart order успешно создан с лишними полями: ${variation.description}`);
      });
    }
  });

  test("Тест-кейс № 4: Проверка создания smart order для пользователя с нулевым балансом", async ({
    request,
  }) => {
    log.info("=== Тест: Создание smart order для пользователя с 0 балансом ===");

    const fromAddress = await createAndActivateFromAddress(request);

    const toWallet = await createWallet();
    const toAddress = toWallet.address?.base58 || "";
    log.info(
      `Создан кошелек toAddress (на него будет делегироваться энергия и bandwidth): ${toAddress}`
    );

    addressCheck.validateAddresses(fromAddress, toAddress);

    const smartOrderRequest = {
      fromAddress,
      toAddress,
      withActivation: true,
      withEnergy: true,
      withBandwidth: true,
    };

    log.info(
      `Отправка запроса на создание smart order с нулевым балансом: ${JSON.stringify(smartOrderRequest, null, 2)}`
    );

    const smartOrderApi = new SmartOrderApi(request);
    const response = await smartOrderApi.createNewSmartOrder({
      data: smartOrderRequest,
      apiKey: apiKeyZero,
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    const status = response.status();
    log.info(`Статус ответа: ${status}`);

    const headers = response.headers();
    const contentType = headers["content-type"] ?? headers["Content-Type"] ?? "";

    if (contentType.includes("application/json")) {
      const responseBody = await response.json().catch(() => undefined);
      log.info(`Response body: ${JSON.stringify(responseBody, null, 2)}`);
    } else {
      const responseText = await response.text().catch(() => "");
      log.info(`Response text: ${responseText}`);
    }

    log.info("✓ Тест завершен: проверка создания smart order для пользователя с нулевым балансом");
  });

  test("Тест-кейс № 5: Проверка создания smart order с неактивированным fromAddress при withActivation=false", async ({
    request,
  }) => {
    log.info(
      "=== Тест: Создание smart order с неактивированным fromAddress и активированным toAddress (withActivation=false) ==="
    );

    const smartOrderApi = new SmartOrderApi(request);

    const fromWallet = await createWallet();
    const fromAddress = fromWallet.address?.base58 || "";
    log.info(`Создан кошелек fromAddress (НЕ активирован): ${fromAddress}`);

    const toAddress = await createAndActivateFromAddress(request);
    log.info(`Создан и активирован кошелек toAddress: ${toAddress}`);

    addressCheck.validateAddresses(fromAddress, toAddress);

    const smartOrderRequest = {
      fromAddress,
      toAddress,
      withActivation: false,
      withEnergy: true,
      withBandwidth: true,
    };

    log.info(
      `Отправка запроса на создание smart order: ${JSON.stringify(smartOrderRequest, null, 2)}`
    );

    const response = await smartOrderApi.createNewSmartOrder({ data: smartOrderRequest });
    const responseStatus = response.status();
    log.info(`API запрос выполнен. Статус: ${responseStatus}`);

    const headers = response.headers();
    const contentType = headers["content-type"] ?? headers["Content-Type"] ?? "";

    if (contentType.includes("application/json")) {
      const responseBody = await response.json().catch(() => undefined);
      log.info(`Response body: ${JSON.stringify(responseBody, null, 2)}`);
    } else {
      const responseText = await response.text().catch(() => "");
      log.info(`Response text: ${responseText}`);
    }

    log.info(
      "✓ Тест завершен: проверка создания smart order с неактивированным fromAddress (withActivation=false)"
    );
  });

  test("Тест-кейс № 6: Проверка создания smart order с активированным fromAddress и неактивированным toAddress", async ({
    request,
  }) => {
    test.setTimeout(200000);
    log.info(
      "=== Тест: Создание smart order с активированным fromAddress и неактивированным toAddress ==="
    );

    const smartOrderApi = new SmartOrderApi(request);

    const fromAddress = await createAndActivateFromAddress(request);
    log.info(`Создан и активирован кошелек fromAddress: ${fromAddress}`);

    const toWallet = await createWallet();
    const toAddress = toWallet.address?.base58 || "";
    log.info(`Создан кошелек toAddress (НЕ активирован): ${toAddress}`);

    addressCheck.validateAddresses(fromAddress, toAddress);

    const smartOrderRequest = {
      fromAddress,
      toAddress,
      withActivation: true,
      withEnergy: true,
      withBandwidth: true,
    };

    log.info(
      `Отправка запроса на создание smart order: ${JSON.stringify(smartOrderRequest, null, 2)}`
    );

    const response = await smartOrderApi.createNewSmartOrder({ data: smartOrderRequest });
    const responseStatus = response.status();
    log.info(`API запрос выполнен. Статус: ${responseStatus}`);

    statusCheck.checkResponseStatus(response);

    const apiSmartOrder = (await response.json()) as SmartOrderWithOrders;
    log.info(`API Response: ${JSON.stringify(apiSmartOrder, null, 2)}`);

    log.info("Проверка обязательных полей и их типов...");
    smartOrderFieldCheck.checkAllFields(apiSmartOrder);

    smartOrderFieldCheck.checkRequestResponseMatch(
      apiSmartOrder,
      fromAddress,
      toAddress,
      true,
      true,
      true
    );

    const dbFinalSmartOrder = await waitForSmartOrderCompleted(apiSmartOrder.id);

    const getSmartOrderResponse = await smartOrderApi.getSmartOrderById({ smartOrderId: apiSmartOrder.id });
    statusCheck.checkResponseStatus(getSmartOrderResponse);
    const apiFinalSmartOrder = (await getSmartOrderResponse.json()) as SmartOrderWithOrders;
    log.info(`API Response (Smart Order, by id): ${JSON.stringify(apiFinalSmartOrder, null, 2)}`);
    log.info(
      `Финальный статус smart order по API: ${apiFinalSmartOrder.status} (smartOrderId=${apiFinalSmartOrder.id})`
    );

    smartOrderFieldCheck.checkAllFields(apiFinalSmartOrder);
    smartOrderResponseCheck.checkSmartOrderFieldEquality(apiFinalSmartOrder, dbFinalSmartOrder);

    log.info("✓ Все проверки полей ответа после создания smart order пройдены");
    log.info(
      "✓ Тест завершен: проверка создания smart order с активированным fromAddress и неактивированным toAddress"
    );
  });

  // // Тест-кейс № 7: Проверка обработки сетевой ошибки при создании smart order
  // test("POST /api/v2/smart-orders/ should handle network error during smart order creation", async ({
  //   request,
  //   page,
  // }) => {
  //   log.info("=== Тест: Симуляция отключения интернета при создании smart order ===");

  //   const fromAddress = await createAndActivateFromAddress(request);

  //   const toWallet = await createWallet();
  //   const toAddress = toWallet.address?.base58 || "";
  //   log.info(
  //     `Создан кошелек toAddress (на него будет делегироваться энергия и bandwidth): ${toAddress}`
  //   );

  //   addressCheck.validateAddresses(fromAddress, toAddress);

  //   const smartOrderRequest = {
  //     fromAddress,
  //     toAddress,
  //     withActivation: true,
  //     withEnergy: true,
  //     withBandwidth: true,
  //   };

  //   log.info(
  //     `Отправка запроса на создание smart order: ${JSON.stringify(smartOrderRequest, null, 2)}`
  //   );

  //   // Перехватываем запрос через page.route и симулируем отключение интернета
  //   let requestAborted = false;
  //   await page.route("**/api/v2/smart-orders/", async (route) => {
  //     log.info("⚠ Симуляция отключения интернета: прерывание запроса");
  //     requestAborted = true;
  //     await route.abort("failed");
  //   });

  //   try {
  //     const response = await request.post(`${apiUrl}/api/v2/smart-orders/`, {
  //       headers: getPostHeaders(),
  //       data: smartOrderRequest,
  //     });
  //     log.warn(`⚠ Запрос не был прерван, статус: ${response.status()}`);
  //   } catch (error: any) {
  //     log.info(`✓ Сетевая ошибка успешно перехвачена: ${error.message}`);
  //     expect(error.message).toMatch(/aborted|failed|network|timeout|ECONNREFUSED|ENOTFOUND/i);
  //   }

  //   expect(requestAborted).toBe(true);
  //   log.info("✓ Тест завершен: проверка обработки сетевой ошибки при создании smart order");
  // });
});
