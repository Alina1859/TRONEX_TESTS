import { APIRequestContext } from "@playwright/test";
import { apiUrl } from "./constants";
import { getHeaders, getPostHeaders } from "../../../shared/utils/headers";

export class OrderApi {
  constructor(private request: APIRequestContext) {}

  async getOrderList(params?: { offset?: any; limit?: any }) {
    return await this.request.get(`${apiUrl}/api/v2/orders/`, {
      headers: getHeaders(),
      params,
    });
  }

  async createNewOrder(data: any) {
    return await this.request.post(`${apiUrl}/api/v2/orders/`, {
      headers: getPostHeaders(),
      data,
    });
  }

  async getOrderById(orderId: any) {
    return await this.request.get(`${apiUrl}/api/v2/orders/${orderId}`, {
      headers: getHeaders(),
    });
  }

  async getOrderByIdWithApiKey(orderId: any, apiKey: string) {
    return await this.request.get(`${apiUrl}/api/v2/orders/${orderId}`, {
      headers: getHeaders(apiKey),
    });
  }

  async getOrderListWithApiKey(apiKey: string) {
    return await this.request.get(`${apiUrl}/api/v2/orders/`, {
      headers: getHeaders(apiKey),
    });
  }

  async createNewOrderWithApiKey(data: any, apiKey: string) {
    return await this.request.post(`${apiUrl}/api/v2/orders/`, {
      headers: getPostHeaders(apiKey),
      data,
    });
  }

  async createNewOrderWithoutContentType(data: any, apiKey: string) {
    return await this.request.post(`${apiUrl}/api/v2/orders/`, {
      headers: getHeaders(apiKey),
      data: JSON.stringify(data),
    });
  }
}
