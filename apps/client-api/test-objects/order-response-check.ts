import { expect } from "@playwright/test";
import { Order } from "@shared/utils/types";

export class OrderResponseCheck {
  checkOrderId(apiOrder: Order, expectedOrderId: string | number) {
    expect(apiOrder.id).toBe(Number(expectedOrderId));
  }

  checkOrderFieldEquality(apiOrder: Order, expected: Partial<Order>) {
    expect(apiOrder.id).toBe(expected.id);
    expect(new Date(apiOrder.createdAt).getTime()).toBe(
      new Date(expected.createdAt as any).getTime()
    );
    expect(apiOrder.status).toBe(expected.status);
    expect(apiOrder.type).toBe(expected.type);
    expect(apiOrder.amount).toBe(expected.amount);
    if (expected.period === 0) {
      expect(apiOrder.period).toBe(expected.period || null);
    } else {
      expect(apiOrder.period).toBe(expected.period);
    }
    expect(apiOrder.targetAddress).toBe(expected.targetAddress);
    expect(apiOrder.blockchainTransaction).toBe(expected.blockchainTransaction);
    expect(String(apiOrder.sellPrice)).toBe(String(expected.sellPrice));
  }

  checkOrderListIsArray(orders: Order[]) {
    expect(Array.isArray(orders)).toBe(true);
  }

  checkOrderListExactLength(orders: Order[], expectedLength: number) {
    expect(orders.length).toBe(expectedLength);
  }

  checkOrderIdsMatch(orders: Order[], expectedOrders: Order[]) {
    expect(orders.map((order) => order.id)).toEqual(expectedOrders.map((order) => order.id));
  }

  checkSortedByCreatedAtDesc(orders: Order[]) {
    for (let i = 1; i < orders.length; i++) {
      const prev = new Date(orders[i - 1].createdAt).getTime();
      const curr = new Date(orders[i].createdAt).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  }

  checkOrderListIsEmpty(orders: Order[], expectedOrders: Order[]) {
    expect(orders.length).toBe(0);
    expect(expectedOrders.length).toBe(0);
  }

  checkOrderListEmpty(orders: Order[]) {
    expect(orders.length).toBe(0);
  }

  checkRateLimitEnforcement(statusCounts: Record<number, number>): void {
    expect(statusCounts[429]).toBeGreaterThan(0);
  }

  checkOrderStatus(apiOrder: Order, expectedStatus: string) {
    expect(apiOrder.status).toBe(expectedStatus);
  }

  checkOrderType(apiOrder: Order, expectedType: string) {
    expect(apiOrder.type).toBe(expectedType);
  }
}
