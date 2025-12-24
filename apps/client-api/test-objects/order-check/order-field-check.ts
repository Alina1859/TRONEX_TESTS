import { expect } from "@playwright/test";
import { Order } from "@shared/utils/types";
import { VALID_ORDER_PERIODS, ORDER_STATUSES, ORDER_TYPES } from "@shared/utils/constants";
import { AddressCheck } from "../address-check";

export class OrderFieldCheck {  
  private addressCheck = new AddressCheck();
  checkId(apiOrder: Order) {
    expect(apiOrder).toHaveProperty("id");
    expect(typeof apiOrder.id).toBe("number");
  }

  checkCreatedAt(apiOrder: Order) {
    expect(apiOrder).toHaveProperty("createdAt");
    expect(typeof apiOrder.createdAt).toBe("string");
    expect(() => new Date(apiOrder.createdAt)).not.toThrow();
    expect(isNaN(new Date(apiOrder.createdAt).getTime())).toBe(false);
  }

  checkStatus(apiOrder: Order) {
    expect(apiOrder).toHaveProperty("status");
    expect(typeof apiOrder.status).toBe("string");
    expect(ORDER_STATUSES).toContain(apiOrder.status);
  }

  checkType(apiOrder: Order) {
    expect(apiOrder).toHaveProperty("type");
    expect(typeof apiOrder.type).toBe("string");
    expect(ORDER_TYPES).toContain(apiOrder.type);
  }

  checkAmount(apiOrder: Order) {
    expect(apiOrder).toHaveProperty("amount");
    expect(typeof apiOrder.amount).toBe("number");
  }

  checkPeriod(apiOrder: Order) {
    expect(apiOrder).toHaveProperty("period");

    const period = (apiOrder as any).period;
    if (period !== null && period !== undefined) {
      expect(typeof period).toBe("number");
      expect(VALID_ORDER_PERIODS).toContain(period);
    } else {
      expect(period).toBeNull();
    }
  }

  checkTargetAddress(apiOrder: Order) {
    expect(apiOrder).toHaveProperty("targetAddress");
    expect(typeof apiOrder.targetAddress).toBe("string");
    expect(apiOrder.targetAddress.length).toBeGreaterThan(0);

    this.addressCheck.checkTronAddress(apiOrder.targetAddress);
  }

  checkBlockchainTransaction(apiOrder: Order) {
    expect(apiOrder).toHaveProperty("blockchainTransaction");
    if (apiOrder.blockchainTransaction !== null) {
      expect(typeof apiOrder.blockchainTransaction).toBe("string");
    } else {
      expect(apiOrder.blockchainTransaction).toBeNull();
    }
  }

  checkSellPrice(apiOrder: Order) {
    expect(apiOrder).toHaveProperty("sellPrice");
    expect(typeof apiOrder.sellPrice).toBe("number");
  }

  checkAllFields(apiOrder: Order) {
    this.checkId(apiOrder);
    this.checkCreatedAt(apiOrder);
    this.checkStatus(apiOrder);
    this.checkType(apiOrder);
    this.checkAmount(apiOrder);
    this.checkPeriod(apiOrder);
    this.checkTargetAddress(apiOrder);
    this.checkBlockchainTransaction(apiOrder);
    this.checkSellPrice(apiOrder);
  }
}
