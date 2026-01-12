import { APIRequestContext, expect } from "@playwright/test";
import { OrderRepository } from "@apps/client-api/repositories/order.repository";
import { OrderApi } from "@apps/client-api/api/order.api";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { log } from "@shared/utils/logger";
import { createWallet } from "@apps/client-api/repositories/tronweb";
import { Order, CreateActivationOrderRequest } from "@shared/utils/types";
import { OrderType } from "@shared/utils/constants";

export class WalletActivationHelper {
  private async waitForOrderStatus(params: {
    orderId: number;
    targetStatus: "COMPLETED";
    timeoutMs: number;
    stepMs: number;
    validateOrder?: (dbOrder: any) => void;
  }) {
    const { orderId, targetStatus, timeoutMs, stepMs, validateOrder } = params;
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

      if (status === targetStatus) {
        log.info(`Заказ в БД завершился ${targetStatus} (orderId=${orderId})`);
        if (validateOrder) {
          validateOrder(dbOrder);
        }
        return dbOrder;
      }

      log.info(`Заказ orderId=${orderId} ещё не в финальном статусе, статус=${status ?? "none"}`);
      await new Promise((r) => setTimeout(r, stepMs));
    }

    throw new Error(`Заказ orderId=${orderId} не перешёл в ${targetStatus} за ${timeoutMs} мс`);
  }

  async waitForActivationCompleted(params: {
    orderId: number;
    targetAddress: string;
    timeoutMs?: number;
    stepMs?: number;
  }) {
    const { orderId, targetAddress, timeoutMs = 30000, stepMs = 1000 } = params;
    return this.waitForOrderStatus({
      orderId,
      targetStatus: "COMPLETED",
      timeoutMs,
      stepMs,
      validateOrder: (dbOrder) => {
        expect(dbOrder.type).toBe("ACTIVATION");
        expect(dbOrder.targetAddress).toBe(targetAddress);
      },
    });
  }

  async waitForOrderCompleted(params: {
    orderId: number;
    timeoutMs?: number;
    stepMs?: number;
  }) {
    const { orderId, timeoutMs = 90000, stepMs = 1000 } = params;
    return this.waitForOrderStatus({
      orderId,
      targetStatus: "COMPLETED",
      timeoutMs,
      stepMs,
    });
  }

  async createActivatedWallet(
    request: APIRequestContext,
    responseStatusCheck?: ResponseStatusCheck
  ) {
    const wallet = await createWallet();
    log.info(`Создан кошелек для активации: ${wallet.address?.base58}`);

    const orderApi = new OrderApi(request);
    const activationRequest: CreateActivationOrderRequest = {
      type: OrderType.ACTIVATION,
      targetAddress: wallet.address?.base58 || "",
    };

    const activationResponse = await orderApi.createNewOrder({ data: activationRequest });
    const activationStatus = activationResponse.status();
    log.info(`API запрос (ACTIVATION) выполнен. Статус: ${activationStatus}`);

    const statusCheck = responseStatusCheck || new ResponseStatusCheck();
    statusCheck.checkResponseStatus(activationResponse);

    const activationOrder = (await activationResponse.json()) as Order;
    log.info(`API Response (ACTIVATION): ${JSON.stringify(activationOrder, null, 2)}`);

    return { wallet, activationOrder };
  }
}

