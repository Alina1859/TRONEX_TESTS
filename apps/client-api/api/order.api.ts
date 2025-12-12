import { APIRequestContext } from "@playwright/test";
import { apiKey, apiUrl } from "./constants";


export class OrderApi {
  constructor(private request: APIRequestContext) {}

  async getOrderList(params?: { offset?: any; limit?: any }) {
    return await this.request.get(`${apiUrl}/api/v2/orders/`, {
      headers: {
        "X-API-KEY": apiKey,
      },
      params,
    });
  }

  async createNewOrder(data: any) {
    return await this.request.post(`${apiUrl}/api/v2/orders/`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      data,
    });
  }

  async getOrderById(orderId: any) {
    return await this.request.get(`${apiUrl}/api/v2/orders/${orderId}`, {
      headers: {
        "X-API-KEY": apiKey,
      },
    });
  }
}
