import { test, expect } from "@playwright/test";
import { CoreRepository } from "@apps/client-api/api/core.api";
import { log } from "@shared/utils/logger";
import { userIdPrimary } from "@apps/client-api/api/constants";
import { providerTestCases } from "@shared/utils/variations_constants/providers-priority-variations";
import { ProviderPriorityCheck } from "@apps/client-api/test-objects/provider-priority-check";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { ProviderSettings } from "@shared/utils/types";

test.describe("Тест-кейс № 1: Установка приоритета провайдера", () => {
  test.describe.configure({ mode: 'serial', timeout: 60000 });

  const providerPriorityCheck = new ProviderPriorityCheck();
  const responseStatusCheck = new ResponseStatusCheck();
  const coreRepo = new CoreRepository();

  let initialProviderSettings: ProviderSettings | null = null;

  test.beforeEach(async () => {
    await test.step("Сохранить начальные настройки провайдеров", async () => {
      try {
        const initialSettingsResponse = await coreRepo.coreUsersUserIdSettingsKeyGet(
          userIdPrimary,
          "PROVIDER_SETTINGS"
        );
        initialProviderSettings = initialSettingsResponse.data || {};
        log.info(`Сохранены начальные настройки PROVIDER_SETTINGS: ${JSON.stringify(initialProviderSettings, null, 2)}`);
      } catch (error) {
        log.warn(`Не удалось получить начальные настройки PROVIDER_SETTINGS: ${error}`);
        initialProviderSettings = null;
      }
    });
  });

  test.afterEach(async () => {
    if (initialProviderSettings !== null) {
      await test.step("Восстановить начальные настройки провайдеров", async () => {
        try {
          await coreRepo.coreUsersUserIdSettingsKeyPut(userIdPrimary, "PROVIDER_SETTINGS", {
            value: initialProviderSettings,
          });
          log.info(`✓ Начальные настройки PROVIDER_SETTINGS восстановлены`);
        } catch (error) {
          log.error(`Ошибка при восстановлении начальных настроек: ${error}`);
          throw error;
        }
      });
    }
  });

  providerTestCases.forEach(({ providerName, priorityValue }, index) => {
    test(`Установка приоритета провайдера ${providerName}`, async () => {
      await test.step("Установить приоритет провайдера", async () => {
        const requestBody = {
          value: {
            [providerName]: {
              priority: priorityValue,
            },
          },
        };

        log.info(`Установка приоритета ${providerName} = ${priorityValue}`);

        const response = await coreRepo.coreUsersUserIdSettingsKeyPut(
          userIdPrimary,
          "PROVIDER_SETTINGS",
          requestBody
        );

        log.info(`📄 Тело ответа API (PUT /settings):`);
        log.info(`${JSON.stringify(response.data, null, 2)}`);

        responseStatusCheck.checkResponseStatus(response);

        const responseData = response.data;
        providerPriorityCheck.checkProviderPriority(responseData, providerName, priorityValue);
      });

      await test.step("Проверить сохранение приоритета", async () => {
        const verifyResponse = await coreRepo.coreUsersUserIdSettingsKeyGet(
          userIdPrimary,
          "PROVIDER_SETTINGS"
        );

        log.info(`📄 Тело ответа API (GET /settings):`);
        log.info(`${JSON.stringify(verifyResponse.data, null, 2)}`);

        const verifyData = verifyResponse.data;

        providerPriorityCheck.checkProviderPriority(verifyData, providerName, priorityValue);
        log.info(`✓ Приоритет ${providerName} успешно установлен и верифицирован`);
      });
    });
  });
});

test.describe("Тест-кейс № 2: Удаление приоритета провайдера", () => {
  test.describe.configure({ mode: 'serial', timeout: 60000 });

  const responseStatusCheck = new ResponseStatusCheck();
  const coreRepo = new CoreRepository();

  test("Удаление приоритета провайдера", async () => {
    await test.step("Удалить приоритет провайдера", async () => {
      const requestBody = {
        value: null
      };

      log.info(`Удаление приоритета провайдера`);

      const response = await coreRepo.coreUsersUserIdSettingsKeyPut(
        userIdPrimary,
        "PROVIDER_SETTINGS",
        requestBody
      );

      log.info(`📄 Тело ответа API (PUT /settings):`);
      log.info(`${JSON.stringify(response.data, null, 2)}`);

      responseStatusCheck.checkResponseStatus(response);

      const responseData = response.data;
      expect(responseData).toBeNull();
      log.info(`✓ Приоритет провайдера успешно удален`);
    });

    await test.step("Проверить удаление приоритета", async () => {
      const verifyResponse = await coreRepo.coreUsersUserIdSettingsKeyGet(
        userIdPrimary,
        "PROVIDER_SETTINGS"
      );

      log.info(`📄 Тело ответа API (GET /settings):`);
      log.info(`${JSON.stringify(verifyResponse.data, null, 2)}`);

      const verifyData = verifyResponse.data;
      expect(verifyData).toBeNull();
      log.info(`✓ Удаление приоритета провайдера успешно верифицировано`);
    });
  });
});
