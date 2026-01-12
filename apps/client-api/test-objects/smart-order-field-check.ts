import { expect } from "@playwright/test";
import { AddressCheck } from "@apps/client-api/test-objects/address-check";
import { SmartOrderWithOrders } from "@shared/utils/types";
import { SmartOrderStatus } from "@shared/utils/constants";
import { OrderFieldCheck } from "./order-field-check";

export class SmartOrderFieldCheck {
  private addressCheck = new AddressCheck();
  checkId(apiSmartOrder: SmartOrderWithOrders) {
    expect(apiSmartOrder).toHaveProperty("id");
    expect(typeof apiSmartOrder.id).toBe("number");
  }

  checkStatus(apiSmartOrder: SmartOrderWithOrders) {
    expect(apiSmartOrder).toHaveProperty("status");
    expect(typeof apiSmartOrder.status).toBe("string");
    expect(Object.values(SmartOrderStatus)).toContain(apiSmartOrder.status);
  }

  checkFromAddress(apiSmartOrder: SmartOrderWithOrders) {
    expect(apiSmartOrder).toHaveProperty("fromAddress");
    expect(typeof apiSmartOrder.fromAddress).toBe("string");
    expect(apiSmartOrder.fromAddress.length).toBeGreaterThan(0);

    this.addressCheck.checkTronAddress(apiSmartOrder.fromAddress);
  }

  checkToAddress(apiSmartOrder: SmartOrderWithOrders) {
    expect(apiSmartOrder).toHaveProperty("toAddress");
    expect(typeof apiSmartOrder.toAddress).toBe("string");
    expect(apiSmartOrder.toAddress.length).toBeGreaterThan(0);

    this.addressCheck.checkTronAddress(apiSmartOrder.toAddress);
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
      orderFieldCheck.checkAllFields(order);
      expect(order.status).toBe("COMPLETED");
    }
  }

  checkRequestResponseMatch(
    apiSmartOrder: SmartOrderWithOrders,
    fromAddress: string,
    toAddress: string,
    withActivation: boolean,
    withEnergy: boolean,
    withBandwidth: boolean
  ) {
    expect(apiSmartOrder.fromAddress).toBe(fromAddress);
    expect(apiSmartOrder.toAddress).toBe(toAddress);
    expect(apiSmartOrder.withActivation).toBe(withActivation);
    expect(apiSmartOrder.withEnergy).toBe(withEnergy);
    expect(apiSmartOrder.withBandwidth).toBe(withBandwidth);
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
