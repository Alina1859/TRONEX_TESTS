import {
  DefaultApiCoreConstantsKeyPutRequest,
  DefaultApiCoreUsersPostRequest,
  DefaultApiCoreUserUserIdAccessTokenGetRequest,
  DefaultApi,
  Configuration,
} from "@tronex-shared/core-api/src";
import { coreApiToken } from "@apps/client-api/api/constants";

export const coreApi = new DefaultApi(
  new Configuration({ basePath: "https://api.tronex-test.com" })
);

export class CoreRepository {
  async coreConstantsKeyGet(key: string, options?: { headers?: Record<string, string> }) {
    return await coreApi.coreConstantsKeyGet(
      {
        key,
      },
      {
        ...options,
        headers: {
          "X-Api-Token": coreApiToken,
          ...(options?.headers || {}),
        },
      }
    );
  }

  async coreConstantsKeyPut(
    key: string,
    coreUsersUserIdSettingsKeyPutRequest: DefaultApiCoreConstantsKeyPutRequest["coreUsersUserIdSettingsKeyPutRequest"],
    options?: { headers?: Record<string, string> }
  ) {
    return await coreApi.coreConstantsKeyPut(
      {
        key,
        coreUsersUserIdSettingsKeyPutRequest,
      },
      {
        ...options,
        headers: {
          "X-Api-Token": coreApiToken,
          ...(options?.headers || {}),
        },
      }
    );
  }

  async coreUsersPost(
    coreUsersPostRequest: DefaultApiCoreUsersPostRequest["coreUsersPostRequest"],
    options?: { headers?: Record<string, string> }
  ) {
    return await coreApi.coreUsersPost(
      {
        coreUsersPostRequest,
      },
      {
        ...options,
        headers: {
          "X-Api-Token": coreApiToken,
          ...(options?.headers || {}),
        },
      }
    );
  }

  async coreUserUserIdAccessTokenGet(
    userId: string,
    options?: { headers?: Record<string, string> }
  ) {
    return await coreApi.coreUserUserIdAccessTokenGet(
      {
        userId,
      },
      {
        ...options,
        headers: {
          "X-Api-Token": coreApiToken,
          ...(options?.headers || {}),
        },
      }
    );
  }
}
