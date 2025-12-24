import { APIRequestContext } from "@playwright/test";
import { apiUrl } from "./constants";
import { getHeaders, getPostHeaders } from "../../../shared/utils/headers";

export class SmartOrderApi {
  constructor(private request: APIRequestContext) {}

  async getSmartOrderById(smartOrderId: any) {
    return await this.request.get(`${apiUrl}/api/v2/smart-orders/${smartOrderId}`, {
      headers: getHeaders(),
    });
  }

  async getSmartOrderByIdWithApiKey(smartOrderId: any, apiKey: string) {
    return await this.request.get(`${apiUrl}/api/v2/smart-orders/${smartOrderId}`, {
      headers: getHeaders(apiKey),
    });
  }

  async createNewSmartOrder(data: any) {
    return await this.request.post(`${apiUrl}/api/v2/smart-orders/`, {
      headers: getPostHeaders(),
      data,
    });
  }

  async createNewSmartOrderWithApiKey(data: any, apiKey: string) {
    return await this.request.post(`${apiUrl}/api/v2/smart-orders/`, {
      headers: getPostHeaders(apiKey),
      data,
    });
  }

  async createNewSmartOrderWithoutContentType(data: any, apiKey: string) {
    return await this.request.post(`${apiUrl}/api/v2/smart-orders/`, {
      headers: getHeaders(apiKey),
      data: JSON.stringify(data),
    });
  }
}
