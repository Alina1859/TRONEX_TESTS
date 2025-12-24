import { expect } from "@playwright/test";
import { SmartOrder, SmartOrderWithOrders, Order } from "@shared/utils/types";
import { OrderResponseCheck } from "../order-check/order-response-check";

export class SmartOrderResponseCheck {
  private orderResponseCheck = new OrderResponseCheck();

  checkSmartOrderId(apiSmartOrder: SmartOrder, expectedSmartOrderId: string | number) {
    expect(apiSmartOrder.id).toBe(Number(expectedSmartOrderId));
  }

  checkSmartOrderFieldEquality(
    apiSmartOrder: SmartOrderWithOrders,
    expected: Partial<SmartOrderWithOrders>
  ) {
    expect(apiSmartOrder.id).toBe(expected.id);
    expect(apiSmartOrder.status).toBe(expected.status);
    expect(apiSmartOrder.fromAddress).toBe(expected.fromAddress);
    expect(apiSmartOrder.toAddress).toBe(expected.toAddress);
    expect(apiSmartOrder.withActivation).toBe(expected.withActivation);
    expect(apiSmartOrder.withEnergy).toBe(expected.withEnergy);
    expect(apiSmartOrder.withBandwidth).toBe(expected.withBandwidth);
    if (expected.orders !== undefined) {
      expect(Array.isArray(apiSmartOrder.orders)).toBe(true);
      expect(apiSmartOrder.orders.length).toBe(expected.orders.length);
      for (let i = 0; i < expected.orders.length; i++) {
        this.orderResponseCheck.checkOrderFieldEquality(
          apiSmartOrder.orders[i],
          expected.orders[i]
        );
      }
    }
  }

  checkSmartOrderListIsArray(smartOrders: SmartOrder[]) {
    expect(Array.isArray(smartOrders)).toBe(true);
  }

  checkSmartOrderListExactLength(smartOrders: SmartOrder[], expectedLength: number) {
    expect(smartOrders.length).toBe(expectedLength);
  }

  checkSmartOrderIdsMatch(smartOrders: SmartOrder[], expectedSmartOrders: SmartOrder[]) {
    expect(smartOrders.map((smartOrder) => smartOrder.id)).toEqual(
      expectedSmartOrders.map((smartOrder) => smartOrder.id)
    );
  }

  checkSmartOrderStatus(apiSmartOrder: SmartOrder, expectedStatus: string) {
    expect(apiSmartOrder.status).toBe(expectedStatus);
  }

  checkRateLimitEnforcement(statusCounts: Record<number, number>): void {
    expect(statusCounts[429]).toBeGreaterThan(0);
  }
}
