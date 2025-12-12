import { test, expect, APIRequestContext } from "@playwright/test";
import { createWallet } from "../repositories/tronweb";
import { log } from "../../../shared/utils/logger";
import { OrderFieldCheck } from "../test-objects/order-field-check";
import { ResponseStatusCheck } from "../test-objects/response-status-check";
import { coreDb } from "../../../shared/database/connection";
import {
  CreateActivationOrderRequest,
  CreateOrderRequest,
  Order,
} from "../../../shared/utils/types";
import { OrderApi } from "../api/order.api";
import { OrderRepository } from "../repositories/order.repository";

test.describe("Create new order", () => {
  const orderFieldCheck = new OrderFieldCheck();
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
  
    const activationResponse = await orderApi.createOrder(activationRequest);
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
      console.log(dbRows);
      const dbOrder = dbRows[0] as any;
      if (dbOrder?.status === "COMPLETED") {
        log.info(`Активация в БД завершена (orderId=${orderId})`);
        expect(dbOrder.type).toBe("ACTIVATION");
        expect(dbOrder.targetAddress).toBe(targetAddress);
        return dbOrder;
      }

      log.info(`Активация orderId=${orderId} ещё не завершена, статус=${dbOrder?.status ?? "none"}`);
      await new Promise((r) => setTimeout(r, stepMs));
    }

    throw new Error(
      `Активация orderId=${orderId} для адреса ${targetAddress} не перешла в COMPLETED за ${timeoutMs} мс`
    );
  }

  // Тест-кейс № 1: Проверка создания нового заказа и валидации полей ответа
  test("POST /api/v2/orders/ should return valid order fields", async ({ request }) => {
    log.info("=== Тест: Создание нового заказа ===");
    const orderApi = new OrderApi(request);
    const { wallet, activationOrder } = await createActivatedWallet(request);
    await waitForActivationCompleted(
      activationOrder.id,
      wallet.address?.base58 || "",
      30000,
      1000
    );

    const energyRequest: CreateOrderRequest = {
      type: "ENERGY",
      targetAddress: wallet.address?.base58 || "",
      amount: 65000,
      period: 3600000,
    };

    const response = await orderApi.createOrder(energyRequest);

    statusCheck.checkResponseStatus(response);

    const apiOrder = (await response.json()) as Order;
    log.info(`API Response (ENERGY): ${JSON.stringify(apiOrder, null, 2)}`);

    orderFieldCheck.checkAllFields(apiOrder, energyRequest.amount);
    expect(apiOrder.type).toBe(energyRequest.type);
    expect(apiOrder.targetAddress).toBe(energyRequest.targetAddress);
    expect(apiOrder.period).toBe(energyRequest.period);

    log.info("✓ Все проверки полей ответа после создания заказа пройдены");
  });
});
