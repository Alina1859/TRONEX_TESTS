import { APIRequestContext } from '@playwright/test';

const apiKey = process.env.API_KEY!;
const apiUrl = process.env.API_URL!;

export class OrderApi {
  constructor(
    private request: APIRequestContext,
  ) {}


  async getOrderById(orderId: string | number) {
    return await this.request.get(`${apiUrl}/api/v2/orders/${orderId}`, {
      headers: {
        'X-API-KEY': apiKey
      }
    });
  }
}

