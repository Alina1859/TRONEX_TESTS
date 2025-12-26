import { APIRequestContext, expect } from "@playwright/test";
import { OrderRepository } from "@apps/client-api/repositories/order.repository";
import { OrderApi } from "@apps/client-api/api/order.api";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { log } from "./logger";
import { createWallet } from "@apps/client-api/repositories/tronweb";
import { Order, CreateActivationOrderRequest } from "./types";

export async function waitForActivationCompleted(
  orderId: number,
  targetAddress: string,
  timeoutMs = 30000,
  stepMs = 1000
) {
  const orderRepo = new OrderRepository();
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


export async function waitForOrderCompleted(
  orderId: number,
  timeoutMs = 90000,
  stepMs = 1000
) {
  const orderRepo = new OrderRepository();
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


export async function createActivatedWallet(
  request: APIRequestContext,
  responseStatusCheck?: ResponseStatusCheck
) {
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

  const statusCheck = responseStatusCheck || new ResponseStatusCheck();
  statusCheck.checkResponseStatus(activationResponse);

  const activationOrder = (await activationResponse.json()) as Order;
  log.info(`API Response (ACTIVATION): ${JSON.stringify(activationOrder, null, 2)}`);

  return { wallet, activationOrder };
}

