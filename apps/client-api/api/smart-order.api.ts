import { APIRequestContext } from "@playwright/test";
import { apiUrl } from "./constants";
import { getHeaders } from "../../../shared/utils/headers";

export class SmartOrderApi {
  static getSmartOrderById(lastSmartOrderId: number) {
    throw new Error("Method not implemented.");
  }
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
}
