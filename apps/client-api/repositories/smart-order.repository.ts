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
}
