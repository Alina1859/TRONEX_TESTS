import { coreDb } from "../../../shared/database/connection";
import { Order } from "../../../shared/utils/types";

export class OrderRepository {
  async getLastOrderByUserId(userId: string): Promise<Order[]> {
    return await coreDb.$queryRaw<Order[]>`
      SELECT 
        id,
        "createdAt",
        status,
        type,
        amount,
        period,
        "targetAddress",
        "blockchainTransaction",
        "sellPrice"
      FROM "Order" 
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `;
  }

  async getOrderById(orderId: number): Promise<{ id: number }[]> {
    return await coreDb.$queryRaw<{ id: number }[]>`
      SELECT 
        id,
        "createdAt",
        status,
        type,
        amount,
        period,
        "targetAddress",
        "blockchainTransaction",
        "sellPrice"
      FROM "Order" 
      WHERE id = ${orderId}
      LIMIT 1
    `;
  }

  async getMaxOrderId(): Promise<number> {
    const result = await coreDb.$queryRaw<{ max_id: number }[]>`
      SELECT MAX(id) as max_id FROM "Order"
    `;
    return result[0]?.max_id || 0;
  }

  async getCompletedOrderByUserId(userId: string): Promise<Order[]> {
    return await coreDb.$queryRaw<Order[]>`
      SELECT id, status, amount FROM "Order" 
      WHERE "userId" = ${userId} AND status = 'COMPLETED'
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `;
  }

  async getFailedOrderByUserId(userId: string): Promise<Order[]> {
    return await coreDb.$queryRaw<Order[]>`
      SELECT id, status, amount FROM "Order" 
      WHERE "userId" = ${userId} AND status = 'FAILED'
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `;
  }

  async getEnergyOrderByUserId(userId: string): Promise<Order[]> {
    return await coreDb.$queryRaw<Order[]>`
      SELECT id, status, amount, type FROM "Order" 
      WHERE "userId" = ${userId} AND type = 'ENERGY'
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `;
  }

  async getBandwidthOrderByUserId(userId: string): Promise<Order[]> {
    return await coreDb.$queryRaw<Order[]>`
      SELECT id, status, amount, type FROM "Order" 
      WHERE "userId" = ${userId} AND type = 'BANDWIDTH'
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `;
  }

  async getActivationOrderByUserId(userId: string): Promise<Order[]> {
    return await coreDb.$queryRaw<Order[]>`
      SELECT id, status, amount, type FROM "Order" 
      WHERE "userId" = ${userId} AND type = 'ACTIVATION'
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `;
  }

  async getOrderUserId(orderId: number): Promise<string | null> {
    const result = await coreDb.$queryRaw<{ userId: string }[]>`
      SELECT "userId" FROM "Order"
      WHERE id = ${orderId}
      LIMIT 1
    `;
    return result[0]?.userId ?? null;
  }

  async getOrdersByUserIdPaginated(
    userId: string,
    offset: number,
    limit: number
  ): Promise<Order[]> {
    return await coreDb.$queryRaw<Order[]>`
      SELECT *
      FROM "Order"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      OFFSET ${offset}
      LIMIT ${limit}
    `;
  }
}
