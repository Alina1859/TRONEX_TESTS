import { expect } from "@playwright/test";
import { Order } from "../../../shared/utils/types";

export class OrderResponseTest {
  checkOrderId(apiOrder: Order, expectedOrderId: string | number) {
    expect(apiOrder.id).toBe(Number(expectedOrderId));
  }

  checkOrderListBasics(orders: Order[], expectedLength: number) {
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBe(expectedLength);
  }
}
