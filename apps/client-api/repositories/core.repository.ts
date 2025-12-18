import { DefaultApiCoreConstantsKeyPutRequest, DefaultApiCoreConstantsKeyGetRequest, DefaultApiCoreUsersPostRequest } from "@tronex-shared/core-api/src";
import { apiKey, coreApiToken } from "../api/constants";
import { coreApi } from "../api/core";

export class CoreRepository {

  async coreConstantsKeyGet(
    key: string,
    options?: { headers?: Record<string, string> }
  ) {
    const requestOptions = {
      ...options,
      headers: {
        "X-Api-Token": coreApiToken,
        ...(options?.headers || {}),
      },
    };

    return await coreApi.coreConstantsKeyGet({
      key,
    }, requestOptions);
  }

  async coreConstantsKeyPut(
    key: string,
    coreUsersUserIdSettingsKeyPutRequest: DefaultApiCoreConstantsKeyPutRequest['coreUsersUserIdSettingsKeyPutRequest'],
    options?: { headers?: Record<string, string> }
  ) {
    const requestOptions = {
      ...options,
      headers: {
        "X-Api-Token": coreApiToken,
        ...(options?.headers || {}),
      },
    };

    return await coreApi.coreConstantsKeyPut({
      key,
      coreUsersUserIdSettingsKeyPutRequest,
    }, requestOptions);
  }

  async coreUsersPost(
    coreUsersPostRequest: DefaultApiCoreUsersPostRequest['coreUsersPostRequest'],
    options?: { headers?: Record<string, string> }
  ) {
    return await coreApi.coreUsersPost({
      coreUsersPostRequest,
    }, options);
  }
}
