import { test } from "@playwright/test";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { DynamicPriceOffsetCheck } from "@apps/client-api/test-objects/dynamic-price-offset-check";
import { CoreRepository } from "@apps/client-api/api/core.api";
import { log } from "@shared/utils/logger";
import { HttpStatus, DYNAMIC_PRICE_OFFSET_TEST_VALUE } from "@shared/utils/constants";
import { userIdPrimary } from "@apps/client-api/api/constants";

test.describe("Set dynamic price offset PUT /core/users/{userId}/settings/DYNAMIC_PRICE_OFFSET", () => {
  test.describe.configure({ mode: "serial", timeout: 60000 });

  const responseStatusCheck = new ResponseStatusCheck();
  const dynamicPriceOffsetCheck = new DynamicPriceOffsetCheck();
  const coreRepo = new CoreRepository();

  test.beforeEach(async () => {
    await test.step("Установить DYNAMIC_PRICE_OFFSET в null", async () => {
      try {
        await coreRepo.coreUsersUserIdSettingsKeyPut({
          userId: userIdPrimary,
          key: "DYNAMIC_PRICE_OFFSET",
          coreUsersUserIdSettingsKeyPutRequest: {
            value: null,
          },
        });
        log.info(`✅ DYNAMIC_PRICE_OFFSET установлен в null`);
      } catch (error) {
        log.error(`Ошибка при установке DYNAMIC_PRICE_OFFSET в null: ${error}`);
        throw error;
      }
    });
  });

  test.afterEach(async () => {
    await test.step("Установить DYNAMIC_PRICE_OFFSET в null", async () => {
      try {
        await coreRepo.coreUsersUserIdSettingsKeyPut({
          userId: userIdPrimary,
          key: "DYNAMIC_PRICE_OFFSET",
          coreUsersUserIdSettingsKeyPutRequest: {
            value: null,
          },
        });
        log.info(`✅ DYNAMIC_PRICE_OFFSET установлен в null`);
      } catch (error) {
        log.error(`Ошибка при установке DYNAMIC_PRICE_OFFSET в null: ${error}`);
        throw error;
      }
    });
  });

  test("Тест-кейс № 1: Установка DYNAMIC_PRICE_OFFSET", async () => {

    await test.step("Отправить PUT-запрос для установки DYNAMIC_PRICE_OFFSET", async () => {
      const requestBody = {
        value: DYNAMIC_PRICE_OFFSET_TEST_VALUE,
      };

      log.info(`Установка DYNAMIC_PRICE_OFFSET = ${requestBody.value}`);
      log.info(`PUT /core/users/${userIdPrimary}/settings/DYNAMIC_PRICE_OFFSET`);
      log.info(`Тело запроса: ${JSON.stringify(requestBody, null, 2)}`);

      const response = await coreRepo.setDynamicPriceOffset(userIdPrimary, requestBody.value);

      log.info(` Тело ответа API (PUT /settings):`);
      log.info(`${JSON.stringify(response.data, null, 2)}`);

      responseStatusCheck.checkResponseStatus(response, HttpStatus.OK);

      dynamicPriceOffsetCheck.checkDynamicPriceOffset(response.data);
      log.info(`✅ DYNAMIC_PRICE_OFFSET успешно установлен: ${response.data}`);
    });

    await test.step("Проверить сохранение DYNAMIC_PRICE_OFFSET", async () => {
      const verifyResponse = await coreRepo.getDynamicPriceOffset(userIdPrimary);

      log.info(` Тело ответа API (GET /settings):`);
      log.info(`${JSON.stringify(verifyResponse.data, null, 2)}`);

      dynamicPriceOffsetCheck.checkDynamicPriceOffset(verifyResponse.data);
      log.info(`✅ DYNAMIC_PRICE_OFFSET успешно установлен и верифицирован: ${verifyResponse.data}`);
    });

    log.info(`✅ Тест завершен успешно`);
  });

  test("Тест-кейс № 2: Удаление DYNAMIC_PRICE_OFFSET", async () => {
    await test.step("Установить DYNAMIC_PRICE_OFFSET перед удалением", async () => {
      await coreRepo.setDynamicPriceOffset(userIdPrimary, DYNAMIC_PRICE_OFFSET_TEST_VALUE);
      log.info(`✅ DYNAMIC_PRICE_OFFSET установлен в ${DYNAMIC_PRICE_OFFSET_TEST_VALUE} перед удалением`);
    });

    await test.step("Отправить PUT-запрос для удаления DYNAMIC_PRICE_OFFSET", async () => {
      const requestBody = {
        value: null,
      };

      log.info(`Удаление DYNAMIC_PRICE_OFFSET (установка в null)`);
      log.info(`PUT /core/users/${userIdPrimary}/settings/DYNAMIC_PRICE_OFFSET`);
      log.info(`Тело запроса: ${JSON.stringify(requestBody, null, 2)}`);

      const response = await coreRepo.coreUsersUserIdSettingsKeyPut({
        userId: userIdPrimary,
        key: "DYNAMIC_PRICE_OFFSET",
        coreUsersUserIdSettingsKeyPutRequest: requestBody,
      });

      log.info(` Тело ответа API (PUT /settings):`);
      log.info(`${JSON.stringify(response.data, null, 2)}`);

      responseStatusCheck.checkResponseStatus(response, HttpStatus.OK);

      dynamicPriceOffsetCheck.checkDynamicPriceOffsetIsNull(response.data);
      log.info(`✅ DYNAMIC_PRICE_OFFSET успешно удален: ${response.data}`);
    });

    await test.step("Проверить удаление DYNAMIC_PRICE_OFFSET", async () => {
      const verifyResponse = await coreRepo.getDynamicPriceOffset(userIdPrimary);

      log.info(` Тело ответа API (GET /settings):`);
      log.info(`${JSON.stringify(verifyResponse.data, null, 2)}`);

      dynamicPriceOffsetCheck.checkDynamicPriceOffsetIsNull(verifyResponse.data);
      log.info(`✅ Удаление DYNAMIC_PRICE_OFFSET успешно верифицировано: ${verifyResponse.data}`);
    });

    log.info(`✅ Тест завершен успешно`);
  });
});
