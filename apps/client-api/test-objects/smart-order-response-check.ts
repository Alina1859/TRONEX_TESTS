import { expect } from "@playwright/test";
import {
  Order,
  SmartOrder,
  SmartOrderWithOrders,
  SmartOrderWithOrdersCombination,
} from "@shared/utils/types";
import { HttpStatus, OrderType } from "@shared/utils/constants";
import { OrderResponseCheck } from "./order-response-check";

export class SmartOrderResponseCheck {
  private orderResponseCheck = new OrderResponseCheck();

  private getOrdersByType(apiSmartOrder: SmartOrderWithOrders, type: Order["type"]): Order[] {
    return apiSmartOrder.orders.filter((order) => order.type === type);
  }

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

  checkSmartOrderStatus(apiSmartOrder: SmartOrder | SmartOrderWithOrders, expectedStatus: string) {
    expect(apiSmartOrder.status).toBe(expectedStatus);
  }

  checkSmartOrderHasNoOrders(apiSmartOrder: SmartOrderWithOrders) {
    expect(Array.isArray(apiSmartOrder.orders)).toBe(true);
    expect(apiSmartOrder.orders.length).toBe(0);
  }

  checkSmartOrderHasOrders(apiSmartOrder: SmartOrderWithOrders) {
    expect(Array.isArray(apiSmartOrder.orders)).toBe(true);
    expect(apiSmartOrder.orders.length).toBeGreaterThan(0);
  }

  checkActivationOrderForFromAddress(order: Order, fromAddress: string) {
    expect(order.targetAddress).toBe(fromAddress);
    expect(order.status).toBe("COMPLETED");
  }

  checkEnergyOrderForFromAddress(order: Order, fromAddress: string, expectedAmount?: number) {
    expect(order.targetAddress).toBe(fromAddress);
    if (expectedAmount !== undefined) {
      expect(order.amount).toBe(expectedAmount);
    }
    expect(order.status).toBe("COMPLETED");
  }

  checkBandwidthOrderForFromAddress(order: Order, fromAddress: string, expectedAmount?: number) {
    expect(order.targetAddress).toBe(fromAddress);
    if (expectedAmount !== undefined) {
      expect(order.amount).toBe(expectedAmount);
    }
    expect(order.status).toBe("COMPLETED");
  }

  checkActivationAndEnergyOrdersForFromAddress(
    apiSmartOrder: SmartOrderWithOrders,
    fromAddress: string,
    options: { withEnergy: boolean; expectedEnergyAmount?: number }
  ) {
    const activationOrders = this.getOrdersByType(apiSmartOrder, OrderType.ACTIVATION);
    const energyOrders = this.getOrdersByType(apiSmartOrder, OrderType.ENERGY);
    const bandwidthOrders = this.getOrdersByType(apiSmartOrder, OrderType.BANDWIDTH);

    expect(activationOrders.length).toBeGreaterThan(0);

    if (options.withEnergy) {
      expect(energyOrders.length).toBeGreaterThan(0);
    } else {
      expect(energyOrders.length).toBe(0);
    }

    expect(bandwidthOrders.length).toBe(0);

    const activationOrder = activationOrders[0];
    this.checkActivationOrderForFromAddress(activationOrder, fromAddress);

    if (options.withEnergy) {
      const energyOrder = energyOrders[0];
      this.checkEnergyOrderForFromAddress(energyOrder, fromAddress, options.expectedEnergyAmount);
    }
  }

  checkActivationPricePositive(order: Order) {
    const activationPrice =
      typeof order.sellPrice === "string" ? parseFloat(order.sellPrice) : order.sellPrice;
    expect(activationPrice, "Стоимость заказа ACTIVATION должна быть больше нуля").toBeGreaterThan(
      0
    );
  }

  checkExpectedOrdersForCombination(
    apiSmartOrder: SmartOrderWithOrders,
    fromAddress: string,
    combination: SmartOrderWithOrdersCombination
  ) {
    for (const expectedType of combination.expectedOrderTypes) {
      const ordersOfType = this.getOrdersByType(apiSmartOrder, expectedType as Order["type"]);
      expect(ordersOfType.length).toBeGreaterThan(0);

      if (expectedType === "ENERGY" && combination.expectedEnergyAmount) {
        const energyOrder = ordersOfType[0];
        this.checkEnergyOrderForFromAddress(
          energyOrder,
          fromAddress,
          combination.expectedEnergyAmount
        );
      } else if (expectedType === "BANDWIDTH" && combination.expectedBandwidthAmount) {
        const bandwidthOrder = ordersOfType[0];
        this.checkBandwidthOrderForFromAddress(
          bandwidthOrder,
          fromAddress,
          combination.expectedBandwidthAmount
        );
      } else if (expectedType === "ACTIVATION") {
        const activationOrder = ordersOfType[0];
        this.checkActivationOrderForFromAddress(activationOrder, fromAddress);
      }
    }
  }

  checkRateLimitEnforcement(statusCounts: Record<number, number>): void {
    expect(statusCounts[HttpStatus.TOO_MANY_REQUESTS]).toBeGreaterThan(0);
  }
}
