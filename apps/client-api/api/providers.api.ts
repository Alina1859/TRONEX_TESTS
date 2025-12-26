import { APIRequestContext } from "@playwright/test";
import { apiUrl } from "./constants";
import { getCoreApiHeaders } from "../../../shared/utils/headers";

export class ProvidersApi {
  constructor(private request: APIRequestContext) {}

  async getProvidersList() {
    return await this.request.get(`${apiUrl}/core/providers/`, {
      headers: getCoreApiHeaders(),
    });
  }

  async getProviderBalance(provider: string) {
    return await this.request.get(`${apiUrl}/core/providers/${provider}/balance`, {
      headers: getCoreApiHeaders(),
    });
  }

  async getProviderPriority(userId: string) {
    return await this.request.get(`${apiUrl}/core/users/${userId}/settings/PROVIDER_SETTINGS`, {
      headers: getCoreApiHeaders(),
    });
  }
}

