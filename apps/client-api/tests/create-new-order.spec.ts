import { test, expect, APIRequestContext } from "@playwright/test";
import { createWallet } from "../repositories/tronweb";
import { log } from "../../../shared/utils/logger";
import { OrderFieldCheck } from "../test-objects/order-field-check";
import { ResponseStatusCheck } from "../test-objects/response-status-check";
import { OrderResponseCheck } from "../test-objects/order-response-check";
import {
  CreateActivationOrderRequest,
  CreateOrderRequest,
  Order,
} from "../../../shared/utils/types";
import { OrderApi } from "../api/order.api";
import { OrderRepository } from "../repositories/order.repository";

test.describe("Create new order", () => {
  const orderFieldCheck = new OrderFieldCheck();
  const orderResponseCheck = new OrderResponseCheck();
  const statusCheck = new ResponseStatusCheck();
  const orderRepo = new OrderRepository();

  async function createActivatedWallet(request: APIRequestContext) {
    const wallet = await createWallet();
    log.info(`Создан кошелек для активации: ${wallet.address?.base58}`);

    const orderApi = new OrderApi(request);
    const activationRequest: CreateActivationOrderRequest = {
      type: "ACTIVATION",
      targetAddress: wallet.address?.base58 || "",
    };

    const activationResponse = await orderApi.createNewOrder(activationRequest);
    const activationStatus = activationResponse.status();
    log.info(`API запрос (ACTIVATION) выполнен. Статус: ${activationStatus}`);
    statusCheck.checkResponseStatus(activationResponse);

    const activationOrder = (await activationResponse.json()) as Order;
    log.info(`API Response (ACTIVATION): ${JSON.stringify(activationOrder, null, 2)}`);

    return { wallet, activationOrder };
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

  async function waitForOrderCompleted(orderId: number, timeoutMs = 90000, stepMs = 1000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const dbRows = await orderRepo.getOrderById(orderId);
      const dbOrder = dbRows[0] as any;

      const status = dbOrder?.status;
      if (status === "FAILED") {
        log.info(`Заказ в БД завершился FAILED (orderId=${orderId})`);
        throw new Error(
          `Заказ orderId=${orderId} завершился FAILED. DB: ${JSON.stringify(dbOrder, null, 2)}`
        );
      }

      if (status === "COMPLETED") {
        log.info(`Заказ в БД завершился COMPLETED (orderId=${orderId})`);
        return dbOrder;
      }

      log.info(`Заказ orderId=${orderId} ещё не в финальном статусе, статус=${status ?? "none"}`);
      await new Promise((r) => setTimeout(r, stepMs));
    }

    throw new Error(`Заказ orderId=${orderId} не перешёл в COMPLETED за ${timeoutMs} мс`);
  }

  // Тест-кейс № 1: Проверка создания нового заказа и валидации полей ответа
  test("POST /api/v2/orders/ should return valid order fields", async ({ request }) => {
    log.info("=== Тест: Создание нового заказа ===");
    const orderApi = new OrderApi(request);
    const { wallet, activationOrder } = await createActivatedWallet(request);
    await waitForActivationCompleted(activationOrder.id, wallet.address?.base58 || "", 30000, 1000);

    const energyRequest: CreateOrderRequest = {
      type: "ENERGY",
      targetAddress: wallet.address?.base58 || "",
      amount: 65000,
      period: 3600000,
    };

    const response = await orderApi.createNewOrder(energyRequest);

    statusCheck.checkResponseStatus(response);

    const apiOrder = (await response.json()) as Order;
    log.info(`API Response (ENERGY): ${JSON.stringify(apiOrder, null, 2)}`);

    orderFieldCheck.checkAllFields(apiOrder);

    const dbFinalOrder = await waitForOrderCompleted(apiOrder.id);
    const getOrderResponse = await orderApi.getOrderById(apiOrder.id);
    statusCheck.checkResponseStatus(getOrderResponse);
    const apiFinalOrder = (await getOrderResponse.json()) as Order;
    log.info(`API Response (ENERGY, by id): ${JSON.stringify(apiFinalOrder, null, 2)}`);
    log.info(
      `Финальный статус заказа по API: ${apiFinalOrder.status} (orderId=${apiFinalOrder.id})`
    );

    orderFieldCheck.checkAllFields(apiFinalOrder);
    orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);

    log.info("✓ Все проверки полей ответа после создания заказа пройдены");
  });

  // Тест-кейс № 2: Проверка создания нового заказа с дополнительными полями
  test("POST /api/v2/orders/ should ignore unknown fields in request body", async ({ request }) => {
    log.info("=== Тест: Создание нового заказа с дополнительными полями ===");
    const orderApi = new OrderApi(request);

    const { wallet, activationOrder } = await createActivatedWallet(request);
    await waitForActivationCompleted(activationOrder.id, wallet.address?.base58 || "", 30000, 1000);

    const energyRequestWithExtraFields = {
      type: "ENERGY",
      targetAddress: wallet.address?.base58 || "",
      amount: 65000,
      period: 3600000,
      unknownField: "value",
      anotherField: 123,
    } as any;

    const response = await orderApi.createNewOrder(energyRequestWithExtraFields);
    statusCheck.checkResponseStatus(response);

    const apiOrder = (await response.json()) as Order;
    log.info(`API Response (ENERGY, extra fields): ${JSON.stringify(apiOrder, null, 2)}`);

    orderFieldCheck.checkAllFields(apiOrder);
    expect(apiOrder).not.toHaveProperty("unknownField");
    expect(apiOrder).not.toHaveProperty("anotherField");

    const dbFinalOrder = await waitForOrderCompleted(apiOrder.id);
    expect((dbFinalOrder as any)?.unknownField).toBeUndefined();
    expect((dbFinalOrder as any)?.anotherField).toBeUndefined();

    const getOrderResponse = await orderApi.getOrderById(apiOrder.id);
    statusCheck.checkResponseStatus(getOrderResponse);
    const apiFinalOrder = (await getOrderResponse.json()) as Order;
    log.info(
      `API Response (ENERGY, extra fields, by id): ${JSON.stringify(apiFinalOrder, null, 2)}`
    );

    orderFieldCheck.checkAllFields(apiFinalOrder);
    orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);

    log.info("✓ Заказ создан, неизвестные поля проигнорированы");
  });
});
