import { coreDb } from "@shared/database/connection";
import { SmartOrder } from "@shared/utils/types";
import { SmartOrderStatus } from "@shared/utils/constants";

export class SmartOrderRepository {
  private async getSmartOrderByUserId(params: {
    userId: string;
    status?: SmartOrderStatus;
  }): Promise<SmartOrder[]> {
    const { userId, status } = params;

    if (status) {
      return await coreDb.$queryRaw<SmartOrder[]>`
        SELECT *
        FROM "SmartOrder"
        WHERE "userId" = ${userId} AND status = ${status}
        ORDER BY "createdAt" DESC
        LIMIT 1
      `;
    }

    return await coreDb.$queryRaw<SmartOrder[]>`
      SELECT *
      FROM "SmartOrder"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;
  }

  async getSmartOrderById(smartOrderId: number): Promise<SmartOrder[]> {
    return await coreDb.$queryRaw<SmartOrder[]>`
      SELECT *
      FROM "SmartOrder"
      WHERE id = ${smartOrderId}
      LIMIT 1
    `;
  }

  async getLastSmartOrderByUserId(userId: string): Promise<SmartOrder[]> {
    return await this.getSmartOrderByUserId({ userId });
  }

  async getMaxSmartOrderId(): Promise<number> {
    const result = await coreDb.$queryRaw<{ max_id: number }[]>`
      SELECT MAX(id) as max_id FROM "SmartOrder"
    `;
    return result[0]?.max_id || 0;
  }

  async getCompletedSmartOrderByUserId(userId: string): Promise<SmartOrder[]> {
    return await this.getSmartOrderByUserId({ userId, status: SmartOrderStatus.COMPLETED });
  }

  async getFailedSmartOrderByUserId(userId: string): Promise<SmartOrder[]> {
    return await this.getSmartOrderByUserId({ userId, status: SmartOrderStatus.FAILED });
  }

  // async getSmartOrderWithoutOrdersByUserId(userId: string): Promise<SmartOrder[]> {
  //   return await coreDb.$queryRaw<SmartOrder[]>`
  //     SELECT so.*
  //     FROM "SmartOrder" so
  //     WHERE so."userId" = ${userId}
  //       AND NOT EXISTS (
  //         SELECT 1
  //         FROM "Order" o
  //         WHERE o."userId" = ${userId}
  //           AND o.source = 'SMART_REFILL'
  //           AND (o.details->>'smartOrderId')::int = so.id
  //       )
  //     ORDER BY so."createdAt" DESC
  //     LIMIT 1
  //   `;
  // }
}
