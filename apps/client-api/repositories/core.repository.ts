import { DefaultApi, Configuration, DefaultApiCoreConstantsKeyPutRequest, DefaultApiCoreUsersPostRequest } from "@tronex-shared/core-api/src";

export class CoreRepository {
  private coreApi: DefaultApi;

  constructor(basePath: string = 'https://api.tronex-test.com') {
    this.coreApi = new DefaultApi(new Configuration({ basePath }));
  }

  async coreConstantsKeyPut(
    key: string,
    coreUsersUserIdSettingsKeyPutRequest: DefaultApiCoreConstantsKeyPutRequest['coreUsersUserIdSettingsKeyPutRequest'],
    options?: { headers?: Record<string, string> }
  ) {
    return await this.coreApi.coreConstantsKeyPut({
      key,
      coreUsersUserIdSettingsKeyPutRequest,
    }, options);
  }

  async coreUsersPost(
    coreUsersPostRequest: DefaultApiCoreUsersPostRequest['coreUsersPostRequest'],
    options?: { headers?: Record<string, string> }
  ) {
    return await this.coreApi.coreUsersPost({
      coreUsersPostRequest,
    }, options);
  }
}
