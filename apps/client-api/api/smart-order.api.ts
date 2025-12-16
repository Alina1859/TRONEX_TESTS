import { APIRequestContext } from "@playwright/test";
import { apiKey, apiUrl } from "./constants";

export class SmartOrderApi {
  static getSmartOrderById(lastSmartOrderId: number) {
    throw new Error("Method not implemented.");
  }
  constructor(private request: APIRequestContext) {}

  async getSmartOrderById(smartOrderId: any) {
    return await this.request.get(`${apiUrl}/api/v2/smart-orders/${smartOrderId}`, {
      headers: {
        "X-API-KEY": apiKey,
      },
    });
  }
}
