import { coreDb } from '../../../shared/database/connection';

export class OrderRepository {
  
  async getLastOrderByUserId(userId: string): Promise<any[]> {
    return await coreDb.$queryRaw<any[]>`
      SELECT id, status, amount FROM "Order" 
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `;
  }

  async getOrderById(orderId: number): Promise<any[]> {
    return await coreDb.$queryRaw<any[]>`
      SELECT id FROM "Order" 
      WHERE id = ${orderId}
      LIMIT 1
    `;
  }

  async getMaxOrderId(): Promise<number> {
    const result = await coreDb.$queryRaw<any[]>`
      SELECT MAX(id) as max_id FROM "Order"
    `;
    return result[0]?.max_id || 0;
  }

}

