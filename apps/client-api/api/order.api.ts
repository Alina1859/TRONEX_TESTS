import { APIRequestContext } from "@playwright/test";
import { apiKeyPrimary, apiUrl } from "./constants";

export class OrderApi {
  constructor(private request: APIRequestContext) {}

  async getOrderList(params?: { offset?: any; limit?: any }) {
    return await this.request.get(`${apiUrl}/api/v2/orders/`, {
      headers: {
        "X-API-KEY": apiKeyPrimary,
      },
      params,
    });
  }

  async createNewOrder(data: any) {
    return await this.request.post(`${apiUrl}/api/v2/orders/`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": apiKeyPrimary,
      },
      data,
    });
  }

  async getOrderById(orderId: any) {
    return await this.request.get(`${apiUrl}/api/v2/orders/${orderId}`, {
      headers: {
        "X-API-KEY": apiKeyPrimary,
      },
    });
  }
}
