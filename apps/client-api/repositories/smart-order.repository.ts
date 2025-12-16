import { coreDb } from "../../../shared/database/connection";
import { SmartOrder } from "../../../shared/utils/types";

export class SmartOrderRepository {
  async getSmartOrderById(smartOrderId: number): Promise<SmartOrder[]> {
    return await coreDb.$queryRaw<SmartOrder[]>`
      SELECT *
      FROM "SmartOrder"
      WHERE id = ${smartOrderId}
      LIMIT 1
    `;
  }

  async getLastSmartOrderByUserId(userId: string): Promise<SmartOrder[]> {
    return await coreDb.$queryRaw<SmartOrder[]>`
      SELECT *
      FROM "SmartOrder"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `;
  }

  async getMaxSmartOrderId(): Promise<number> {
    const result = await coreDb.$queryRaw<{ max_id: number }[]>`
      SELECT MAX(id) as max_id FROM "SmartOrder"
    `;
    return result[0]?.max_id || 0;
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
