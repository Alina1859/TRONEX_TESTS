import { expect, APIResponse } from "@playwright/test";
import { log } from "../../../shared/utils/logger";

export class ResponseStatusCheck {
  checkResponseStatus(response: APIResponse, expectedStatus: number = 200) {
    const actualStatus = response.status();
    log.info(`Проверка статуса ответа: ожидаемый ${expectedStatus}, фактический ${actualStatus}`);

    const isMatch = actualStatus === expectedStatus;
    if (isMatch) {
      log.info(`✓ Статус ответа корректен: ${actualStatus}`);
    } else {
      log.error(
        `✗ Статус ответа не совпадает: ожидался ${expectedStatus}, получен ${actualStatus}`
      );
    }

    expect(actualStatus).toBe(expectedStatus);
  }
}
