import { expect } from "@playwright/test";
import { Order } from "../../../shared/utils/types";

export class OrderResponseCheck {
  checkOrderId(apiOrder: Order, expectedOrderId: string | number) {
    expect(apiOrder.id).toBe(Number(expectedOrderId));
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
}
