import { APIRequestContext } from "@playwright/test";
import { ORDERS_BASE_URL } from "./constants";
import { getHeaders, getPostHeaders } from "../../../shared/utils/headers";

export class OrderApi {
  constructor(private request: APIRequestContext) {}

  async getOrderList(params?: { offset?: any; limit?: any; apiKey?: string }) {
    const queryParams: { offset?: any; limit?: any } = {};
    if (params?.offset !== undefined) queryParams.offset = params.offset;
    if (params?.limit !== undefined) queryParams.limit = params.limit;

    return await this.request.get(ORDERS_BASE_URL, {
      headers: getHeaders(params?.apiKey),
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
  }

  async createNewOrder(params: { data: any; apiKey?: string; withoutContentType?: boolean }) {
    const { data, apiKey, withoutContentType } = params;
    return await this.request.post(ORDERS_BASE_URL, {
      headers: withoutContentType ? getHeaders(apiKey) : getPostHeaders(apiKey),
      data: withoutContentType ? JSON.stringify(data) : data,
    });
  }

  async getOrderById(params: { orderId: any; apiKey?: string }) {
    return await this.request.get(`${ORDERS_BASE_URL}${params.orderId}`, {
      headers: getHeaders(params.apiKey),
    });
  }
}
