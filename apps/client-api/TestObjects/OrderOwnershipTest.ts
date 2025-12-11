import { expect } from "@playwright/test";
import { Order } from "../../../shared/utils/types";
import { OrderFieldTest } from "./OrderFieldTest";
import { OrderRepository } from "../repositories/order.repository";
import { PRIMARY_USER_ID } from "../api/order.api";

export const checkOrdersBelongToPrimaryUser = async (orders: Order[]) => {
  const orderRepo = new OrderRepository();

  for (const order of orders) {
    const userIdFromDb = await orderRepo.getOrderUserId(order.id);
    expect(userIdFromDb).toBe(PRIMARY_USER_ID);
  }
};
