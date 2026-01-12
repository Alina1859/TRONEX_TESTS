import {
  DefaultApiCoreConstantsKeyPutRequest,
  DefaultApiCoreUsersPostRequest,
  DefaultApiCoreUsersUserIdSettingsKeyPutRequest,
  DefaultApi,
  Configuration,
} from "@tronex-shared/core-api/src";
import { getCoreApiHeaders } from "@shared/utils/headers";
import { apiUrl } from "./constants";

export const coreApi = new DefaultApi(
  new Configuration({ basePath: apiUrl })
);

export class CoreRepository {
  async coreConstantsKeyGet(params: { key: string }) {
    return await coreApi.coreConstantsKeyGet(
      { key: params.key },
      { headers: getCoreApiHeaders() }
    );
  }

  async coreUsersUserIdSettingsKeyGet(params: {
    userId: string;
    key: string;
    useCache?: boolean;
  }) {
    return await coreApi.coreUsersUserIdSettingsKeyGet(params, {
      headers: getCoreApiHeaders(),
    });
  }

  async coreUsersUserIdSettingsKeyPut(params: {
    userId: string;
    key: string;
    coreUsersUserIdSettingsKeyPutRequest: DefaultApiCoreUsersUserIdSettingsKeyPutRequest["coreUsersUserIdSettingsKeyPutRequest"];
  }) {
    return await coreApi.coreUsersUserIdSettingsKeyPut(params, {
      headers: getCoreApiHeaders(),
    });
  }

  async coreConstantsKeyPut(params: {
    key: string;
    coreUsersUserIdSettingsKeyPutRequest: DefaultApiCoreConstantsKeyPutRequest["coreUsersUserIdSettingsKeyPutRequest"];
  }) {
    return await coreApi.coreConstantsKeyPut(params, {
      headers: getCoreApiHeaders(),
    });
  }

  async coreUsersPost(params: {
    coreUsersPostRequest: DefaultApiCoreUsersPostRequest["coreUsersPostRequest"];
  }) {
    return await coreApi.coreUsersPost(params, {
      headers: getCoreApiHeaders(),
    });
  }

  async coreUserUserIdAccessTokenGet(params: { userId: string }) {
    return await coreApi.coreUserUserIdAccessTokenGet(params, {
      headers: getCoreApiHeaders(),
    });
  }

  async coreUsersUserIdDelete(params: { userId: string }) {
    return await coreApi.coreUsersUserIdDelete(params, {
      headers: getCoreApiHeaders(),
    });
  }

  async setProviderSettings(
    userId: string,
    providerSettings: Record<string, { priority: number; dynamicPriority?: boolean }>
  ) {
    return await this.coreUsersUserIdSettingsKeyPut({
      userId,
      key: "PROVIDER_SETTINGS",
      coreUsersUserIdSettingsKeyPutRequest: {
        value: providerSettings,
      },
    });
  }

  async setDynamicPriceOffset(userId: string, offset: number) {
    return await this.coreUsersUserIdSettingsKeyPut({
      userId,
      key: "DYNAMIC_PRICE_OFFSET",
      coreUsersUserIdSettingsKeyPutRequest: {
        value: offset,
      },
    });
  }

  async coreProvidersGet() {
    return await coreApi.coreProvidersGet({
      headers: getCoreApiHeaders(),
    });
  }

  async coreProvidersProviderBalanceGet(params: { provider: string }) {
    return await coreApi.coreProvidersProviderBalanceGet(params, {
      headers: getCoreApiHeaders(),
    });
  }

  async getProviderPriority(userId: string, useCache?: boolean) {
    return await this.coreUsersUserIdSettingsKeyGet({
      userId,
      key: "PROVIDER_SETTINGS",
      useCache,
    });
  }

  async getDynamicPriceOffset(userId: string, useCache?: boolean) {
    return await this.coreUsersUserIdSettingsKeyGet({
      userId,
      key: "DYNAMIC_PRICE_OFFSET",
      useCache,
    });
  }
}

