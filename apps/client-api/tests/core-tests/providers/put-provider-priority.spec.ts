import { test, expect } from "@playwright/test";
import { CoreRepository } from "@apps/client-api/repositories/core.repository";
import { log } from "@shared/utils/logger";
import { HTTP_STATUS_OK } from "@shared/utils/constants";
import { userIdPrimary } from "@apps/client-api/api/constants";
import { providerTestCases } from "@shared/utils/variations_constants/providers-priority-variations";
import { ProviderPriorityCheck } from "@apps/client-api/test-objects/provider-priority-check";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";

// Тест-кейс № 1: Установка приоритета провайдера
test.describe("PUT Provider Priority API", () => {
  const providerPriorityCheck = new ProviderPriorityCheck();
  const responseStatusCheck = new ResponseStatusCheck();

  providerTestCases.forEach(({ providerName, priorityValue }, index) => {
    test(`Тест-кейс № ${index + 1}: Установка приоритета провайдера ${providerName}`, async ({
      request,
    }) => {
      log.info(`=== Тест: Установка приоритета провайдера ${providerName} ===`);

      const coreRepo = new CoreRepository();

      let initialProviderSettings: Record<string, { priority: number }> | null = null;
      try {
        const initialSettingsResponse = await coreRepo.coreUsersUserIdSettingsKeyGet(
          userIdPrimary,
          "PROVIDER_SETTINGS"
        );
        initialProviderSettings = initialSettingsResponse.data || {};
        log.info(
          `Начальные настройки PROVIDER_SETTINGS: ${JSON.stringify(initialProviderSettings, null, 2)}`
        );
      } catch (error) {
        log.warn(`Не удалось получить начальные настройки PROVIDER_SETTINGS: ${error}`);
      }

      try {
        const requestBody = {
          value: {
            [providerName]: {
              priority: priorityValue,
            },
          },
        };

        log.info(`Отправка PUT-запроса с телом: ${JSON.stringify(requestBody, null, 2)}`);

        const response = await coreRepo.coreUsersUserIdSettingsKeyPut(
          userIdPrimary,
          "PROVIDER_SETTINGS",
          requestBody
        );

        log.info(`API запрос выполнен. Статус: ${response.status}`);

        responseStatusCheck.checkResponseStatus(response);

        const responseData = response.data;
        log.info(`Полученный ответ: ${JSON.stringify(responseData, null, 2)}`);

        providerPriorityCheck.checkProviderPriorityResponse(responseData, providerName, priorityValue);
        log.info(`✓ Ответ содержит провайдера "${providerName}" с приоритетом ${priorityValue}`);

        const verifyResponse = await coreRepo.coreUsersUserIdSettingsKeyGet(
          userIdPrimary,
          "PROVIDER_SETTINGS"
        );
        const verifyData = verifyResponse.data;
        log.info(`Проверка сохраненных настроек: ${JSON.stringify(verifyData, null, 2)}`);

        providerPriorityCheck.checkProviderPrioritySaved(verifyData, providerName, priorityValue);
        log.info(`✓ Настройки успешно сохранены и верифицированы`);

        log.info(`✓ Тест установки приоритета провайдера ${providerName} завершен успешно`);
      } finally {
        if (initialProviderSettings !== null) {
          try {
            await coreRepo.coreUsersUserIdSettingsKeyPut(userIdPrimary, "PROVIDER_SETTINGS", {
              value: initialProviderSettings,
            });
            log.info(`✓ Начальные настройки PROVIDER_SETTINGS восстановлены`);
          } catch (error) {
            log.error(`Ошибка при восстановлении начальных настроек: ${error}`);
          }
        }
      }
    });
  });
});
