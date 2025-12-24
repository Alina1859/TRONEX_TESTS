import { test, expect, APIRequestContext } from "@playwright/test";
import { createWallet } from "@apps/client-api/repositories/tronweb";
import { log } from "@shared/utils/logger";
import { SmartOrderFieldCheck } from "@apps/client-api/test-objects/smart-order-field-check";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { SmartOrderResponseCheck } from "@apps/client-api/test-objects/smart-order-response-check";
import { AddressCheck } from "@apps/client-api/test-objects/address-check";
import { SmartOrderApi } from "@apps/client-api/api/smart-order.api";
import { SmartOrderRepository } from "@apps/client-api/repositories/smart-order.repository";
import { OrderApi } from "@apps/client-api/api/order.api";
import { OrderRepository } from "@apps/client-api/repositories/order.repository";
import { SmartOrderWithOrders, CreateActivationOrderRequest, Order } from "@shared/utils/types";
import { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_OK } from "@shared/utils/constants";
import { invalidCreateSmartOrderRequestVariations } from "@shared/utils/variations_constants/invalid-smart-order-request-variations";
import { invalidSmartOrderExtraFieldsVariations } from "@shared/utils/variations_constants/invalid-smart-order-extra-fields-variations";

test.describe("Create new smart order", () => {
  const smartOrderFieldCheck = new SmartOrderFieldCheck();
  const smartOrderResponseCheck = new SmartOrderResponseCheck();
  const statusCheck = new ResponseStatusCheck();
  const smartOrderRepo = new SmartOrderRepository();
  const addressCheck = new AddressCheck();
  const orderRepo = new OrderRepository();

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

    const activationResponse = await orderApi.createNewOrder(activationRequest);
    const activationStatus = activationResponse.status();
    log.info(`API запрос (ACTIVATION) выполнен. Статус: ${activationStatus}`);
    statusCheck.checkResponseStatus(activationResponse);

    const activationOrder = (await activationResponse.json()) as Order;
    log.info(`API Response (ACTIVATION): ${JSON.stringify(activationOrder, null, 2)}`);

    await waitForActivationCompleted(activationOrder.id, fromAddress, timeoutMs, stepMs);
    log.info(`Кошелек fromAddress активирован: ${fromAddress}`);

    return fromAddress;
  }

  async function waitForActivationCompleted(
    orderId: number,
    targetAddress: string,
    timeoutMs = 30000,
    stepMs = 1000
  ) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const dbRows = await orderRepo.getOrderById(orderId);
      const dbOrder = dbRows[0] as any;
      if (dbOrder?.status === "COMPLETED") {
        log.info(`Активация в БД завершена (orderId=${orderId})`);
        expect(dbOrder.type).toBe("ACTIVATION");
        expect(dbOrder.targetAddress).toBe(targetAddress);
        return dbOrder;
      }

      log.info(
        `Активация orderId=${orderId} ещё не завершена, статус=${dbOrder?.status ?? "none"}`
      );
      await new Promise((r) => setTimeout(r, stepMs));
    }

    throw new Error(
      `Активация orderId=${orderId} для адреса ${targetAddress} не перешла в COMPLETED за ${timeoutMs} мс`
    );
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

  // Тест-кейс № 1: Проверка создания нового smart order и валидации полей ответа
  test("POST /api/v2/smart-orders/ should return valid smart order fields", async ({ request }) => {
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

    const response = await smartOrderApi.createNewSmartOrder(smartOrderRequest);
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

    const getSmartOrderResponse = await smartOrderApi.getSmartOrderById(apiSmartOrder.id);
    statusCheck.checkResponseStatus(getSmartOrderResponse);
    const apiFinalSmartOrder = (await getSmartOrderResponse.json()) as SmartOrderWithOrders;
    log.info(`API Response (Smart Order, by id): ${JSON.stringify(apiFinalSmartOrder, null, 2)}`);
    log.info(
      `Финальный статус smart order по API: ${apiFinalSmartOrder.status} (smartOrderId=${apiFinalSmartOrder.id})`
    );

    smartOrderFieldCheck.checkAllFields(apiFinalSmartOrder);
    smartOrderResponseCheck.checkSmartOrderFieldEquality(apiFinalSmartOrder, dbFinalSmartOrder);

    log.info("✓ Все проверки полей ответа после создания smart order пройдены");
  });

  // Тест-кейс № 2: Проверка невалидных значений в запросе
  for (const variation of invalidCreateSmartOrderRequestVariations) {
    test(`POST /api/v2/smart-orders/ should reject invalid request: ${variation.description}`, async ({
      request,
    }) => {
      const smartOrderApi = new SmartOrderApi(request);

      const response = await smartOrderApi.createNewSmartOrder(variation.data);
      statusCheck.checkResponseStatus(response, HTTP_STATUS_BAD_REQUEST);

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

  // Тест-кейс № 3: Проверка игнорирования лишних полей в запросе
  for (const variation of invalidSmartOrderExtraFieldsVariations) {
    test(`POST /api/v2/smart-orders/ should ignore extra fields: ${variation.description}`, async ({
      request,
    }) => {
      const smartOrderApi = new SmartOrderApi(request);

      const fromAddress = await createAndActivateFromAddress(request);
      const toWallet = await createWallet();
      const toAddress = toWallet.address?.base58 || "";

      // Заменяем валидные адреса из вариации на реальные
      const requestData = {
        ...variation.data,
        fromAddress,
        toAddress,
      };

      const response = await smartOrderApi.createNewSmartOrder(requestData);
      statusCheck.checkResponseStatus(response, HTTP_STATUS_OK);

      const apiSmartOrder = (await response.json()) as SmartOrderWithOrders;
      log.info(`API Response (with extra fields): ${JSON.stringify(apiSmartOrder, null, 2)}`);

      // Проверяем, что smart order создан корректно, несмотря на лишние поля
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
