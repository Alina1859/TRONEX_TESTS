import { coreDb } from "@shared/database/connection";
import { Order } from "@shared/utils/types";
import { OrderStatus, OrderType } from "@shared/utils/constants";

export class OrderRepository {
  private async getOrderByUserId(params: {
    userId: string;
    status?: OrderStatus;
    type?: OrderType;
  }): Promise<Order[]> {
    const { userId, status, type } = params;
    
    if (status && type) {
      return await coreDb.$queryRaw<Order[]>`
        SELECT *
        FROM "Order"
        WHERE "userId" = ${userId} AND status = ${status} AND type = ${type}
        ORDER BY "createdAt" DESC
        LIMIT 1
      `;
    }
    
    if (status) {
      return await coreDb.$queryRaw<Order[]>`
        SELECT *
        FROM "Order"
        WHERE "userId" = ${userId} AND status = ${status}
        ORDER BY "createdAt" DESC
        LIMIT 1
      `;
    }
    
    if (type) {
      return await coreDb.$queryRaw<Order[]>`
        SELECT *
        FROM "Order"
        WHERE "userId" = ${userId} AND type = ${type}
        ORDER BY "createdAt" DESC
        LIMIT 1
      `;
    }
    
    return await coreDb.$queryRaw<Order[]>`
      SELECT *
      FROM "Order"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;
  }

  async getLastOrderByUserId(userId: string): Promise<Order[]> {
    return await this.getOrderByUserId({ userId });
  }

  async getOrderById(orderId: number): Promise<Order[]> {
    return await coreDb.$queryRaw<Order[]>`
      SELECT *
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
    return await this.getOrderByUserId({ userId, status: OrderStatus.COMPLETED });
  }

  async getFailedOrderByUserId(userId: string): Promise<Order[]> {
    return await this.getOrderByUserId({ userId, status: OrderStatus.FAILED });
  }

  async getEnergyOrderByUserId(userId: string): Promise<Order[]> {
    return await this.getOrderByUserId({ userId, type: OrderType.ENERGY });
  }

  async getBandwidthOrderByUserId(userId: string): Promise<Order[]> {
    return await this.getOrderByUserId({ userId, type: OrderType.BANDWIDTH });
  }

  async getActivationOrderByUserId(userId: string): Promise<Order[]> {
    return await this.getOrderByUserId({ userId, type: OrderType.ACTIVATION });
  }

  async getOrderUserId(orderId: number): Promise<string | null> {
    const result = await coreDb.$queryRaw<{ userId: string }[]>`
      SELECT "userId" FROM "Order"
      WHERE id = ${orderId}
      LIMIT 1
    `;
    return result[0]?.userId ?? null;
  }

  async getOrdersByUserIdPaginated(params: {
    userId: string;
    offset: number;
    limit: number;
  }): Promise<Order[]> {
    const { userId, offset, limit } = params;
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
