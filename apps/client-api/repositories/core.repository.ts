import {
  DefaultApiCoreConstantsKeyPutRequest,
  DefaultApiCoreUsersPostRequest,
  DefaultApiCoreUsersUserIdSettingsKeyPutRequest,
  DefaultApi,
  Configuration,
} from "@tronex-shared/core-api/src";
import { getCoreApiHeaders } from "@shared/utils/headers";
import { log } from "@shared/utils/logger";

export const coreApi = new DefaultApi(
  new Configuration({ basePath: "https://api.tronex-test.com" })
);

export class CoreRepository {
  async coreConstantsKeyGet(key: string) {
    return await coreApi.coreConstantsKeyGet(
      {
        key,
      },
      {
        headers: getCoreApiHeaders(),
      }
    );
  }

  async coreUsersUserIdSettingsKeyGet(userId: string, key: string, useCache?: boolean) {
    return await coreApi.coreUsersUserIdSettingsKeyGet(
      {
        userId,
        key,
        useCache,
      },
      {
        headers: getCoreApiHeaders(),
      }
    );
  }

  async coreUsersUserIdSettingsKeyPut(
    userId: string,
    key: string,
    coreUsersUserIdSettingsKeyPutRequest: DefaultApiCoreUsersUserIdSettingsKeyPutRequest["coreUsersUserIdSettingsKeyPutRequest"]
  ) {
    const requestParams = {
      userId,
      key,
      coreUsersUserIdSettingsKeyPutRequest,
    };
    log.info(
      `Отправка запроса coreUsersUserIdSettingsKeyPut: ${JSON.stringify(requestParams, null, 2)}`
    );
    return await coreApi.coreUsersUserIdSettingsKeyPut(requestParams, {
      headers: getCoreApiHeaders(),
    });
  }

  async coreConstantsKeyPut(
    key: string,
    coreUsersUserIdSettingsKeyPutRequest: DefaultApiCoreConstantsKeyPutRequest["coreUsersUserIdSettingsKeyPutRequest"]
  ) {
    return await coreApi.coreConstantsKeyPut(
      {
        key,
        coreUsersUserIdSettingsKeyPutRequest,
      },
      {
        headers: getCoreApiHeaders(),
      }
    );
  }

  async coreUsersPost(
    coreUsersPostRequest: DefaultApiCoreUsersPostRequest["coreUsersPostRequest"]
  ) {
    return await coreApi.coreUsersPost(
      {
        coreUsersPostRequest,
      },
      {
        headers: getCoreApiHeaders(),
      }
    );
  }

  async coreUserUserIdAccessTokenGet(userId: string) {
    return await coreApi.coreUserUserIdAccessTokenGet(
      {
        userId,
      },
      {
        headers: getCoreApiHeaders(),
      }
    );
  }
}
