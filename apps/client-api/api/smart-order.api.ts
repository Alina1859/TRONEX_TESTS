import { APIRequestContext } from "@playwright/test";
import { SMART_ORDERS_BASE_URL } from "./constants";
import { getHeaders, getPostHeaders } from "../../../shared/utils/headers";

export class SmartOrderApi {
  constructor(private request: APIRequestContext) {}

  async getSmartOrderById(params: { smartOrderId: any; apiKey?: string }) {
    return await this.request.get(`${SMART_ORDERS_BASE_URL}${params.smartOrderId}`, {
      headers: getHeaders(params.apiKey),
    });
  }

  async createNewSmartOrder(params: { data: any; apiKey?: string; withoutContentType?: boolean }) {
    const { data, apiKey, withoutContentType } = params;
    return await this.request.post(SMART_ORDERS_BASE_URL, {
      headers: withoutContentType ? getHeaders(apiKey) : getPostHeaders(apiKey),
      data: withoutContentType ? JSON.stringify(data) : data,
    });
  }
}
