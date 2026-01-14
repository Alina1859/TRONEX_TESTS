import { test } from "@playwright/test";
import { createWallet } from "@apps/client-api/repositories/tronweb";
import { log } from "@shared/utils/logger";
import { SmartOrderFieldCheck } from "@apps/client-api/test-objects/smart-order-field-check";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { SmartOrderResponseCheck } from "@apps/client-api/test-objects/smart-order-response-check";
import { AddressCheck } from "@apps/client-api/test-objects/address-check";
import { SmartOrderApi } from "@apps/client-api/api/smart-order.api";
import { apiKeyZero } from "@apps/client-api/api/constants";
import { SmartOrderWithOrders, Order } from "@shared/utils/types";
import { HttpStatus, OrderType } from "@shared/utils/constants";
import { invalidCreateSmartOrderRequestVariations } from "@shared/utils/variations_constants/invalid-create-smart-order-request-variations";
import { invalidSmartOrderExtraFieldsVariations } from "@shared/utils/variations_constants/invalid-smart-order-extra-fields-variations";
import { PriceCheck } from "@apps/client-api/test-objects/price-check";
import { CoreRepository } from "@apps/client-api/api/core.api";
import { EnergyOrderPeriodMs, BandwidthOrderPeriodMs } from "@shared/utils/types";
import { SmartOrderTestHelper } from "@shared/helpers/smart-order-helper";
import { SMART_ORDER_NO_ORDERS_COMBINATIONS } from "@shared/utils/variations_constants/smart-order-no-orders-variations";
import { SMART_ORDER_WITH_ORDERS_COMBINATIONS } from "@shared/utils/variations_constants/smart-order-with-orders-variations";
import { FROM_UNAUTH_TO_AUTH_COMBINATIONS } from "@shared/utils/variations_constants/smart-order-from-unauth-to-auth-variations";

test.describe("Create new smart order POST /api/v2/smart-orders/", () => {
  const smartOrderFieldCheck = new SmartOrderFieldCheck();
  const smartOrderResponseCheck = new SmartOrderResponseCheck();
  const statusCheck = new ResponseStatusCheck();
  const addressCheck = new AddressCheck();
  const smartOrderTestHelper = new SmartOrderTestHelper();

  test("Тест-кейс № 1: Проверка создания нового smart order и валидации полей ответа", async ({
    request,
  }) => {
    log.info("=== Тест: Создание нового smart order ===");

    const smartOrderApi = new SmartOrderApi(request);

    const fromAddress = await smartOrderTestHelper.createAndActivateFromAddress(request);

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

    const dbFinalSmartOrder = await smartOrderTestHelper.waitForSmartOrderCompleted(
      apiSmartOrder.id
    );

    const getSmartOrderResponse = await smartOrderApi.getSmartOrderById({
      smartOrderId: apiSmartOrder.id,
    });
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
        const priceCheck = new PriceCheck(coreRepo, order);
        await priceCheck.checkEnergyOrderPriceByFormula({
          period: order.period as EnergyOrderPeriodMs,
          energyAmount: order.amount,
        });
      } else if (order.type === "BANDWIDTH" && order.amount && order.period) {
        const priceCheck = new PriceCheck(coreRepo, order);
        await priceCheck.checkBandwidthOrderPriceByFormula({
          period: order.period as BandwidthOrderPeriodMs,
          bandwidthAmount: order.amount,
        });
      } else if (order.type === "ACTIVATION") {
        smartOrderResponseCheck.checkActivationPricePositive(order);
      }
    }

    log.info("✓ Все проверки полей ответа после создания smart order пройдены");
  });

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

  test.describe("Тест-кейс № 3: Проверка игнорирования лишних полей в запросе", () => {
    for (const variation of invalidSmartOrderExtraFieldsVariations) {
      test(`${variation.description}`, async ({ request }) => {
        const smartOrderApi = new SmartOrderApi(request);

        const fromAddress = await smartOrderTestHelper.createAndActivateFromAddress(request);
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

    const fromAddress = await smartOrderTestHelper.createAndActivateFromAddress(request);

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

    const toAddress = await smartOrderTestHelper.createAndActivateFromAddress(request);
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

    const fromAddress = await smartOrderTestHelper.createAndActivateFromAddress(request);
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

    const dbFinalSmartOrder = await smartOrderTestHelper.waitForSmartOrderCompleted(
      apiSmartOrder.id
    );

    const getSmartOrderResponse = await smartOrderApi.getSmartOrderById({
      smartOrderId: apiSmartOrder.id,
    });
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

  test.describe("Тест-кейс № 7: Smart order не создает подзаказы в сценариях, когда они не требуются", () => {
    for (const combination of SMART_ORDER_NO_ORDERS_COMBINATIONS) {
      test(`${combination.description}`, async ({ request }) => {
        test.setTimeout(120000);

        const smartOrderApi = new SmartOrderApi(request);

        log.info(`=== ${combination.description} ===`);

        let fromAddress: string;
        let toAddress: string;

        if (combination.addressSetup === "FROM_WITH_RESOURCES_TO_ACTIVATED") {
          if (combination.lowBandwidth) {
            log.info(
              "Используем createFromAddressWithResourcesAndLowBandwidth для сценария с низким Bandwidth"
            );
            fromAddress = await smartOrderTestHelper.createFromAddressWithResourcesAndLowBandwidth(
              request,
              { energyAmount: combination.energyAmount ?? 65000 }
            );
          } else {
            fromAddress = await smartOrderTestHelper.createFromAddressWithResources(request, {
              energyAmount: combination.energyAmount ?? 65000,
            });
          }
          toAddress = await smartOrderTestHelper.createAndActivateFromAddress(request);
        } else if (combination.addressSetup === "BOTH_ACTIVATED") {
          if (combination.lowBandwidth) {
            log.info(
              "Используем createActivatedFromAddressWithLowBandwidth для сценария с низким Bandwidth"
            );
            fromAddress =
              await smartOrderTestHelper.createActivatedFromAddressWithLowBandwidth(request);
          } else {
            fromAddress = await smartOrderTestHelper.createAndActivateFromAddress(request);
          }
          toAddress = await smartOrderTestHelper.createAndActivateFromAddress(request);
        } else {
          throw new Error(
            `Неизвестный addressSetup в SMART_ORDER_NO_ORDERS_COMBINATIONS: ${combination.addressSetup}`
          );
        }

        addressCheck.validateAddresses(fromAddress, toAddress);

        const smartOrderRequest = {
          fromAddress,
          toAddress,
          withActivation: combination.withActivation,
          withEnergy: combination.withEnergy,
          withBandwidth: combination.withBandwidth,
        };

        log.info(
          `Отправка запроса на создание smart order (ожидается отсутствие подзаказов): ${JSON.stringify(
            smartOrderRequest,
            null,
            2
          )}`
        );

        const response = await smartOrderApi.createNewSmartOrder({ data: smartOrderRequest });
        const responseStatus = response.status();
        log.info(`API запрос выполнен. Статус: ${responseStatus}`);

        statusCheck.checkResponseStatus(response, HttpStatus.OK);

        const apiSmartOrder = (await response.json()) as SmartOrderWithOrders;
        log.info(`API Response (INIT smart order): ${JSON.stringify(apiSmartOrder, null, 2)}`);

        const dbFinalSmartOrder = await smartOrderTestHelper.waitForSmartOrderCompleted(
          apiSmartOrder.id
        );

        const getSmartOrderResponse = await smartOrderApi.getSmartOrderById({
          smartOrderId: apiSmartOrder.id,
        });
        statusCheck.checkResponseStatus(getSmartOrderResponse, HttpStatus.OK);
        const apiFinalSmartOrder = (await getSmartOrderResponse.json()) as SmartOrderWithOrders;
        log.info(
          `API Response (Smart Order, by id, ожидается COMPLETED без orders): ${JSON.stringify(
            apiFinalSmartOrder,
            null,
            2
          )}`
        );

        smartOrderResponseCheck.checkSmartOrderStatus(apiFinalSmartOrder, "COMPLETED");
        smartOrderFieldCheck.checkAllFields(apiFinalSmartOrder);
        smartOrderResponseCheck.checkSmartOrderFieldEquality(apiFinalSmartOrder, dbFinalSmartOrder);

        smartOrderResponseCheck.checkSmartOrderHasNoOrders(apiFinalSmartOrder);

        log.info(
          "✓ Smart order завершился COMPLETED без создания подзаказов в указанной комбинации условий"
        );
      });
    }
  });

  test.describe("Тест-кейс № 8: Smart order создает подзаказы в сценариях, когда они требуются", () => {
    for (const combination of SMART_ORDER_WITH_ORDERS_COMBINATIONS) {
      test(`Тест №8 – ${combination.description}`, async ({ request }) => {
        test.setTimeout(120000);

        const smartOrderApi = new SmartOrderApi(request);

        log.info(`=== ${combination.description} ===`);

        let fromAddress: string;
        let toAddress: string;

        if (combination.addressSetup === "FROM_WITH_RESOURCES_TO_ACTIVATED") {
          if (combination.lowBandwidth) {
            log.info(
              "Используем createFromAddressWithResourcesAndLowBandwidth для сценария с низким Bandwidth"
            );
            fromAddress = await smartOrderTestHelper.createFromAddressWithResourcesAndLowBandwidth(
              request,
              { energyAmount: combination.energyAmount ?? 65000 }
            );
          } else {
            fromAddress = await smartOrderTestHelper.createFromAddressWithResources(request, {
              energyAmount: combination.energyAmount ?? 65000,
            });
          }
          toAddress = await smartOrderTestHelper.createAndActivateFromAddress(request);
        } else if (combination.addressSetup === "BOTH_ACTIVATED") {
          if (combination.lowBandwidth) {
            log.info(
              "Используем createActivatedFromAddressWithLowBandwidth для сценария с низким Bandwidth"
            );
            fromAddress =
              await smartOrderTestHelper.createActivatedFromAddressWithLowBandwidth(request);
          } else {
            fromAddress = await smartOrderTestHelper.createAndActivateFromAddress(request);
          }
          toAddress = await smartOrderTestHelper.createAndActivateFromAddress(request);
        } else {
          throw new Error(
            `Неизвестный addressSetup в SMART_ORDER_WITH_ORDERS_COMBINATIONS: ${combination.addressSetup}`
          );
        }

        log.info(`Создан и активирован fromAddress: ${fromAddress}`);
        log.info(`Создан и активирован toAddress: ${toAddress}`);

        addressCheck.validateAddresses(fromAddress, toAddress);

        const smartOrderRequest = {
          fromAddress,
          toAddress,
          withActivation: combination.withActivation,
          withEnergy: combination.withEnergy,
          withBandwidth: combination.withBandwidth,
        };

        log.info(
          `Отправка запроса на создание smart order (ожидается создание подзаказов): ${JSON.stringify(
            smartOrderRequest,
            null,
            2
          )}`
        );

        const response = await smartOrderApi.createNewSmartOrder({ data: smartOrderRequest });
        const responseStatus = response.status();
        log.info(`API запрос выполнен. Статус: ${responseStatus}`);

        statusCheck.checkResponseStatus(response, HttpStatus.OK);

        const apiSmartOrder = (await response.json()) as SmartOrderWithOrders;
        log.info(`API Response (INIT smart order): ${JSON.stringify(apiSmartOrder, null, 2)}`);

        const dbFinalSmartOrder = await smartOrderTestHelper.waitForSmartOrderCompleted(
          apiSmartOrder.id
        );

        const getSmartOrderResponse = await smartOrderApi.getSmartOrderById({
          smartOrderId: apiSmartOrder.id,
        });
        statusCheck.checkResponseStatus(getSmartOrderResponse, HttpStatus.OK);
        const apiFinalSmartOrder = (await getSmartOrderResponse.json()) as SmartOrderWithOrders;
        log.info(
          `API Response (Smart Order, by id, ожидается COMPLETED с подзаказами): ${JSON.stringify(
            apiFinalSmartOrder,
            null,
            2
          )}`
        );

        smartOrderResponseCheck.checkSmartOrderStatus(apiFinalSmartOrder, "COMPLETED");
        smartOrderFieldCheck.checkAllFields(apiFinalSmartOrder);
        smartOrderResponseCheck.checkSmartOrderFieldEquality(apiFinalSmartOrder, dbFinalSmartOrder);

        smartOrderResponseCheck.checkSmartOrderHasOrders(apiFinalSmartOrder);
        smartOrderResponseCheck.checkExpectedOrdersForCombination(
          apiFinalSmartOrder,
          fromAddress,
          combination
        );

        const coreRepo = new CoreRepository();
        for (const order of apiFinalSmartOrder.orders) {
          if (order.type === "ENERGY" && order.amount && order.period) {
            const priceCheck = new PriceCheck(coreRepo, order);
            await priceCheck.checkEnergyOrderPriceByFormula({
              period: order.period as EnergyOrderPeriodMs,
              energyAmount: order.amount,
            });
          } else if (order.type === "BANDWIDTH" && order.amount && order.period) {
            const priceCheck = new PriceCheck(coreRepo, order);
            await priceCheck.checkBandwidthOrderPriceByFormula({
              period: order.period as BandwidthOrderPeriodMs,
              bandwidthAmount: order.amount,
            });
          }
        }

        log.info(
          `✓ Smart order создал подзаказы ожидаемых типов: ${combination.expectedOrderTypes.join(", ")}`
        );
      });
    }
  });

  test.describe("Тест-кейс № 9: Проверка создания smart order с неактивированным fromAddress и активированным toAddress (разные комбинации флагов)", () => {
    for (const combination of FROM_UNAUTH_TO_AUTH_COMBINATIONS) {
      test(`Тест №9 – ${combination.description}`, async ({ request }) => {
        test.setTimeout(200000);
        log.info(`=== Тест-кейс № 9: ${combination.description} ===`);

        const smartOrderApi = new SmartOrderApi(request);

        const fromWallet = await createWallet();
        const fromAddress = fromWallet.address?.base58 || "";
        log.info(`Создан кошелек fromAddress (НЕ активирован): ${fromAddress}`);

        const toAddress = await smartOrderTestHelper.createAndActivateFromAddress(request);
        log.info(`Создан и активирован кошелек toAddress: ${toAddress}`);

        addressCheck.validateAddresses(fromAddress, toAddress);

        const smartOrderRequest = {
          fromAddress,
          toAddress,
          withActivation: combination.withActivation,
          withEnergy: combination.withEnergy,
          withBandwidth: combination.withBandwidth,
        };

        log.info(
          `Отправка запроса на создание smart order (ожидается создание ACTIVATION и ENERGY подзаказов): ${JSON.stringify(
            smartOrderRequest,
            null,
            2
          )}`
        );

        const response = await smartOrderApi.createNewSmartOrder({ data: smartOrderRequest });
        const responseStatus = response.status();
        log.info(`API запрос выполнен. Статус: ${responseStatus}`);

        statusCheck.checkResponseStatus(response, HttpStatus.OK);

        const apiSmartOrder = (await response.json()) as SmartOrderWithOrders;
        log.info(`API Response (INIT smart order): ${JSON.stringify(apiSmartOrder, null, 2)}`);

        const dbFinalSmartOrder = await smartOrderTestHelper.waitForSmartOrderCompleted(
          apiSmartOrder.id
        );

        const getSmartOrderResponse = await smartOrderApi.getSmartOrderById({
          smartOrderId: apiSmartOrder.id,
        });
        statusCheck.checkResponseStatus(getSmartOrderResponse, HttpStatus.OK);
        const apiFinalSmartOrder = (await getSmartOrderResponse.json()) as SmartOrderWithOrders;
        log.info(
          `API Response (Smart Order, by id, ожидается COMPLETED с ACTIVATION и ENERGY): ${JSON.stringify(
            apiFinalSmartOrder,
            null,
            2
          )}`
        );

        smartOrderResponseCheck.checkSmartOrderStatus(apiFinalSmartOrder, "COMPLETED");
        smartOrderFieldCheck.checkAllFields(apiFinalSmartOrder);
        smartOrderResponseCheck.checkSmartOrderFieldEquality(apiFinalSmartOrder, dbFinalSmartOrder);

        smartOrderResponseCheck.checkSmartOrderHasOrders(apiFinalSmartOrder);

        smartOrderResponseCheck.checkActivationAndEnergyOrdersForFromAddress(
          apiFinalSmartOrder,
          fromAddress,
          { withEnergy: combination.withEnergy, expectedEnergyAmount: 65000 }
        );

        const coreRepo = new CoreRepository();
        for (const order of apiFinalSmartOrder.orders) {
          if (order.type === "ENERGY" && order.amount && order.period) {
            const priceCheck = new PriceCheck(coreRepo, order);
            await priceCheck.checkEnergyOrderPriceByFormula({
              period: order.period as EnergyOrderPeriodMs,
              energyAmount: order.amount,
            });
          } else if (order.type === "BANDWIDTH" && order.amount && order.period) {
            const priceCheck = new PriceCheck(coreRepo, order);
            await priceCheck.checkBandwidthOrderPriceByFormula({
              period: order.period as BandwidthOrderPeriodMs,
              bandwidthAmount: order.amount,
            });
          } else if (order.type === "ACTIVATION") {
            smartOrderResponseCheck.checkActivationPricePositive(order as Order);
          }
        }

        log.info(
          `✓ Тест-кейс № 9 успешно выполнен: создан smart order с ожидаемыми подзаказами для неактивированного fromAddress`
        );
      });
    }
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
