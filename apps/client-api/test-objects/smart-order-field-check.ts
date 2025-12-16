import { expect } from "@playwright/test";
import { OrderFieldCheck } from "./order-field-check";
import { SMART_ORDER_STATUSES, SmartOrderWithOrders } from "../../../shared/utils/types";

export class SmartOrderFieldCheck {
  checkId(apiSmartOrder: SmartOrderWithOrders) {
    expect(apiSmartOrder).toHaveProperty("id");
    expect(typeof apiSmartOrder.id).toBe("number");
  }

  checkStatus(apiSmartOrder: SmartOrderWithOrders) {
    expect(apiSmartOrder).toHaveProperty("status");
    expect(typeof apiSmartOrder.status).toBe("string");
    expect(SMART_ORDER_STATUSES).toContain(apiSmartOrder.status);
  }

  checkFromAddress(apiSmartOrder: SmartOrderWithOrders) {
    expect(apiSmartOrder).toHaveProperty("fromAddress");
    expect(typeof apiSmartOrder.fromAddress).toBe("string");
    expect(apiSmartOrder.fromAddress.length).toBeGreaterThan(0);

    const address = apiSmartOrder.fromAddress;
    expect(address.length).toBe(34);
    expect(address.startsWith("T")).toBe(true);

    const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    expect(base58Regex.test(address)).toBe(true);
  }

  checkToAddress(apiSmartOrder: SmartOrderWithOrders) {
    expect(apiSmartOrder).toHaveProperty("toAddress");
    expect(typeof apiSmartOrder.toAddress).toBe("string");
    expect(apiSmartOrder.toAddress.length).toBeGreaterThan(0);

    const address = apiSmartOrder.toAddress;
    expect(address.length).toBe(34);
    expect(address.startsWith("T")).toBe(true);

    const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    expect(base58Regex.test(address)).toBe(true);
  }

  checkWithActivation(apiSmartOrder: SmartOrderWithOrders) {
    expect(apiSmartOrder).toHaveProperty("withActivation");
    expect(typeof apiSmartOrder.withActivation).toBe("boolean");
  }

  checkWithEnergy(apiSmartOrder: SmartOrderWithOrders) {
    expect(apiSmartOrder).toHaveProperty("withEnergy");
    expect(typeof apiSmartOrder.withEnergy).toBe("boolean");
  }

  checkWithBandwidth(apiSmartOrder: SmartOrderWithOrders) {
    expect(apiSmartOrder).toHaveProperty("withBandwidth");
    expect(typeof apiSmartOrder.withBandwidth).toBe("boolean");
  }

  checkWithOrders(apiSmartOrder: SmartOrderWithOrders) {
    expect(apiSmartOrder).toHaveProperty("orders");
    expect(Array.isArray(apiSmartOrder.orders)).toBe(true);

    const orderFieldCheck = new OrderFieldCheck();
    for (const order of apiSmartOrder.orders) {
      expect(order).not.toBeNull();
      expect(typeof order).toBe("object");
      orderFieldCheck.checkAllFields(order);
    }
  }

  checkAllFields(apiSmartOrder: SmartOrderWithOrders) {
    this.checkId(apiSmartOrder);
    this.checkStatus(apiSmartOrder);
    this.checkFromAddress(apiSmartOrder);
    this.checkToAddress(apiSmartOrder);
    this.checkWithActivation(apiSmartOrder);
    this.checkWithEnergy(apiSmartOrder);
    this.checkWithBandwidth(apiSmartOrder);
    this.checkWithOrders(apiSmartOrder);
  }
}
