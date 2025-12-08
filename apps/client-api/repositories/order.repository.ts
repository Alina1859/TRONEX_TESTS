import { coreDb } from '../../../shared/database/connection';

export class OrderRepository {
  /**
   * Retrieves an order by its ID.
   * @param id The ID of the order to retrieve.
   * @returns The order object or undefined if not found.
   */
  async getOrderById(id: number) {
    const result = await coreDb.$queryRaw<any[]>`
      SELECT * FROM "Order" 
      WHERE id = ${id}
    `;
    
    return result[0];
  }
}

