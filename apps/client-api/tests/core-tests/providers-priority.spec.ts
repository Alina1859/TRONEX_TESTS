import { test, expect } from "@playwright/test";
import { ProvidersApi } from "@apps/client-api/api/providers.api";
import { OrderApi } from "@apps/client-api/api/order.api";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { CoreRepository } from "@apps/client-api/repositories/core.repository";
import { log } from "@shared/utils/logger";
import { HTTP_STATUS_OK, OrderPeriod } from "@shared/utils/constants";
import { userIdPrimary } from "@apps/client-api/api/constants";
import {
  TEST_ORDER_COMBINATIONS,
} from "@shared/utils/variations_constants/providers-priority-variations";
import { CreateOrderRequest, Order, Provider } from "@shared/utils/types";
import {
  createActivatedWallet,
  waitForActivationCompleted,
  waitForOrderCompleted,
} from "@shared/utils/activate-wallets";

    //Тест-кейс № 1: Проверка приоритетов провайдеров при создании заказов по умолчанию
test.describe("Providers Priority Tests", () => {
  const responseStatusCheck = new ResponseStatusCheck();

  test("should create orders with correct providers based on priority and availability", async ({
    request,
  }) => {
    test.setTimeout(300000);
    log.info("=== Тест: Проверка приоритетов провайдеров при создании заказов ===");

    const providersApi = new ProvidersApi(request);
    const orderApi = new OrderApi(request);
    const coreRepo = new CoreRepository();

    // Получаем список провайдеров
    const providersResponse = await providersApi.getProvidersList();
    responseStatusCheck.checkResponseStatus(providersResponse, HTTP_STATUS_OK);
    const providers = await providersResponse.json();

    log.info(`Получено ${providers.length} провайдеров`);

    const priorityResponse = await coreRepo.coreUsersUserIdSettingsKeyGet(
      userIdPrimary,
      "PROVIDER_SETTINGS"
    );
    const prioritySettings: Record<string, { priority: number }> = priorityResponse.data || {};
    log.info(`Текущие приоритеты провайдеров: ${JSON.stringify(prioritySettings, null, 2)}`);

    const supportsDuration = (provider: Provider, duration: "1h" | "1d" | "3d"): boolean => {
      const energyConfig = provider.availabilityConfig?.ENERGY;
      if (energyConfig === true) {
        return true;
      }
      if (Array.isArray(energyConfig)) {
        return energyConfig.includes(duration);
      }
      return false;
    };

    const getExpectedProvider = (
      providers: Provider[],
      priorities: Record<string, { priority: number }>,
      duration: "1h" | "1d" | "3d"
    ): string | null => {
      const sortedProviders = [...providers].sort((a, b) => {
        const priorityA = priorities[a.name]?.priority || 0;
        const priorityB = priorities[b.name]?.priority || 0;
        return priorityB - priorityA; 
      });

      for (const provider of sortedProviders) {
        if (supportsDuration(provider, duration)) {
          log.info(
            `Для длительности ${duration} выбран провайдер ${provider.name} с приоритетом ${priorities[provider.name]?.priority || 0}`
          );
          return provider.name;
        }
      }

      return null;
    };

    const { wallet, activationOrder } = await createActivatedWallet(request, responseStatusCheck);
    const targetAddress = wallet.address?.base58 || "";

    await waitForActivationCompleted(activationOrder.id, targetAddress, 30000, 1000);

    const durationToPeriod = (duration: "1h" | "1d" | "3d"): number => {
      switch (duration) {
        case "1h":
          return OrderPeriod.ONE_HOUR;
        case "1d":
          return OrderPeriod.ONE_DAY;
        case "3d":
          return OrderPeriod.THREE_DAYS;
        default:
          throw new Error(`Неизвестная длительность: ${duration}`);
      }
    };

    for (const combination of TEST_ORDER_COMBINATIONS) {
      log.info(
        `\n=== Тестирование комбинации: duration=${combination.duration}, energy=${combination.energy} ===`
      );

      const expectedProvider = getExpectedProvider(
        providers,
        prioritySettings,
        combination.duration
      );

      if (!expectedProvider) {
        log.warn(
          `⚠ Не найден провайдер, поддерживающий длительность ${combination.duration}`
        );
        continue;
      }

      log.info(`Ожидаемый провайдер для ${combination.duration}: ${expectedProvider}`);

      const orderRequest: CreateOrderRequest = {
        type: "ENERGY",
        targetAddress,
        amount: combination.energy,
        period: durationToPeriod(combination.duration),
      };

      log.info(`Создание заказа: ${JSON.stringify(orderRequest, null, 2)}`);

      const orderResponse = await orderApi.createNewOrder(orderRequest);
      responseStatusCheck.checkResponseStatus(orderResponse);

      const apiOrder = (await orderResponse.json()) as Order;
      log.info(`Заказ создан: id=${apiOrder.id}`);

      const dbFinalOrder = await waitForOrderCompleted(apiOrder.id, 90000, 1000);
      log.info(
        `Заказ завершен. Order ID: ${apiOrder.id}, Provider в БД: ${dbFinalOrder.provider}`
      );

      expect(dbFinalOrder.provider).toBe(expectedProvider);
      log.info(
        `✓ Провайдер в БД (${dbFinalOrder.provider}) соответствует ожидаемому (${expectedProvider})`
      );

      const getOrderResponse = await orderApi.getOrderById(apiOrder.id);
      responseStatusCheck.checkResponseStatus(getOrderResponse);
    }

    log.info("\n✓ Все комбинации протестированы успешно");
    log.info("✓ Тест проверки приоритетов провайдеров завершен успешно");
  });

  //Тест-кейс № 2: Проверка комбинаций приоритетов провайдеров при создании заказов
  
});
