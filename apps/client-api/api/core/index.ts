import { DefaultApi } from "@tronex-shared/core-api/src";
import { Configuration } from "@tronex-shared/core-api/src";

export const coreApi = new DefaultApi(new Configuration({basePath: 'https://api.tronex-test.com'}));