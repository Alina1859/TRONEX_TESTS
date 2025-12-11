import { APIRequestContext } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const PRIMARY_USER_ID = process.env.USER_ID_PRIMARY!;
const apiKey = process.env.API_KEY_PRIMARY!;
const apiUrl = process.env.API_URL!;


export class OrderApi {
  constructor(private request: APIRequestContext) {}

  async getOrderById(orderId: string | number) {
    return await this.request.get(`${apiUrl}/api/v2/orders/${orderId}`, {
      headers: {
        "X-API-KEY": apiKey,
      },
    });
  }

  async getOrderList(params?: { offset?: any; limit?: any }) {
    return await this.request.get(`${apiUrl}/api/v2/orders/`, {
      headers: {
        "X-API-KEY": apiKey,
      },
      params,
    });
  }
}
