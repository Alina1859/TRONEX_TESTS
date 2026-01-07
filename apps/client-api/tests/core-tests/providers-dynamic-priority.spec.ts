import { test, expect } from "@playwright/test";
import { ProvidersApi } from "@apps/client-api/api/providers.api";
import { OrderApi } from "@apps/client-api/api/order.api";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { CoreRepository } from "@apps/client-api/repositories/core.repository";
import { log } from "@shared/utils/logger";
import { HTTP_STATUS_OK, OrderPeriod, ENERGY_PRICE_FORMULA_DYNAMIC } from "@shared/utils/constants";
import { userIdPrimary } from "@apps/client-api/api/constants";
import { CreateOrderRequest, Order, Provider } from "@shared/utils/types";
import {
  createActivatedWallet,
  waitForActivationCompleted,
  waitForOrderCompleted,
} from "@shared/utils/activate-wallets";

// Тест-кейс № 1: Проверка динамического приоритета провайдеров при создании заказов
test.describe("Providers Dynamic Priority Tests", () => {
  const responseStatusCheck = new ResponseStatusCheck();

  test("should create order with correct price using dynamic priority and ENERGY_PRICE_FORMULA_DYNAMIC", async ({
    request,
  }) => {
    test.setTimeout(300000);
    log.info("=== Тест: Проверка динамического приоритета провайдеров при создании заказов ===");

    const providersApi = new ProvidersApi(request);
    const orderApi = new OrderApi(request);
    const coreRepo = new CoreRepository();

    // Сохраняем начальные значения настроек для восстановления после теста
    let initialProviderSettings: Record<string, { priority: number; dynamicPriority?: boolean }> | null = null;
    let initialDynamicPriceOffset: number | null = null;

    try {
      // Получаем список провайдеров
      const providersResponse = await providersApi.getProvidersList();
      responseStatusCheck.checkResponseStatus(providersResponse, HTTP_STATUS_OK);
      const providers: Provider[] = await providersResponse.json();

      log.info(`Получено ${providers.length} провайдеров`);

      // Находим всех провайдеров с last1hEnergyPrice для проверки
      const providersWithPrice = providers.filter(
        (p: Provider) => p.last1hEnergyPrice !== null && p.last1hEnergyPrice !== undefined
      );

      if (providersWithPrice.length === 0) {
        throw new Error("Не найдено провайдеров с last1hEnergyPrice");
      }

      log.info(`Найдено ${providersWithPrice.length} провайдеров с last1hEnergyPrice для проверки`);

      // Получаем начальное значение DYNAMIC_PRICE_OFFSET
      const initialDynamicPriceOffsetResponse = await coreRepo.coreUsersUserIdSettingsKeyGet(
        userIdPrimary,
        "DYNAMIC_PRICE_OFFSET"
      );
      initialDynamicPriceOffset = initialDynamicPriceOffsetResponse.data || null;
      log.info(`Начальное значение DYNAMIC_PRICE_OFFSET: ${initialDynamicPriceOffset}`);

      // Получаем начальные настройки провайдеров
      const priorityResponse = await coreRepo.coreUsersUserIdSettingsKeyGet(
        userIdPrimary,
        "PROVIDER_SETTINGS"
      );
      initialProviderSettings = priorityResponse.data || null;
      log.info(
        `Начальные настройки провайдеров: ${JSON.stringify(initialProviderSettings, null, 2)}`
      );

      // Устанавливаем DYNAMIC_PRICE_OFFSET = 10
      const dynamicPriceOffset = 10;
      await coreRepo.setDynamicPriceOffset(userIdPrimary, dynamicPriceOffset);
      log.info(`DYNAMIC_PRICE_OFFSET установлен: ${dynamicPriceOffset}`);

      // Создаем кошелек и активируем его один раз для всех тестов
      const { wallet, activationOrder } = await createActivatedWallet(request, responseStatusCheck);
      const targetAddress = wallet.address?.base58 || "";

      await waitForActivationCompleted(activationOrder.id, targetAddress, 30000, 1000);

      const energyAmount = 65000;
      const tolerance = 0.01;

      // Проверяем каждого провайдера по очереди
      for (const provider of providersWithPrice) {
        const minSunRate = provider.last1hEnergyPrice || 0;
        log.info(
          `\n=== Проверка провайдера ${provider.name} с last1hEnergyPrice=${minSunRate} ===`
        );

        // Вычисляем sunRate для 1h: last1hEnergyPrice + DYNAMIC_PRICE_OFFSET
        const sunRate = minSunRate + dynamicPriceOffset;
        log.info(
          `sunRate для 1h = last1hEnergyPrice (${minSunRate}) + DYNAMIC_PRICE_OFFSET (${dynamicPriceOffset}) = ${sunRate}`
        );

        // Вычисляем ожидаемую цену используя ENERGY_PRICE_FORMULA_DYNAMIC
        // Для 1h: hour = 1, day = 0
        // ВАЖНО: Используем цену текущего провайдера, так как мы установим dynamicPriority только для него
        let expectedPrice = ENERGY_PRICE_FORMULA_DYNAMIC(
          minSunRate,
          1, // hour
          0, // day
          energyAmount,
          dynamicPriceOffset
        );

        log.info(
          `Предварительная ожидаемая цена для ${energyAmount} энергии на 1h: ${expectedPrice} TRX (MinSunRate=${minSunRate}, dynamicPriceOffset=${dynamicPriceOffset})`
        );

        // Устанавливаем dynamicPriority: true только для текущего провайдера
        // Сбрасываем dynamicPriority для всех остальных провайдеров
        // Устанавливаем высокий приоритет для текущего провайдера, чтобы он был выбран
        const providerSettings: Record<string, { priority: number; dynamicPriority?: boolean }> = {};
        
        // Устанавливаем настройки для всех провайдеров
        for (const p of providers) {
          const initialSettings = initialProviderSettings?.[p.name];
          providerSettings[p.name] = {
            priority: p.name === provider.name ? 100 : (initialSettings?.priority || 10),
            // Устанавливаем dynamicPriority: true только для текущего провайдера
            dynamicPriority: p.name === provider.name ? true : false,
          };
        }

        await coreRepo.setProviderSettings(userIdPrimary, providerSettings);
        log.info(
          `Установлен dynamicPriority: true для провайдера ${provider.name} с приоритетом 100 (остальные имеют низкий приоритет)`
        );
        
        // Находим минимальную цену среди всех провайдеров с dynamicPriority: true
        // (в данном случае это только текущий провайдер, но для корректности используем эту логику)
        const providersWithDynamicPriority = providersWithPrice.filter(
          (p: Provider) => providerSettings[p.name]?.dynamicPriority === true
        );
        
        const actualMinSunRate = providersWithDynamicPriority.reduce((min: number, p: Provider) => {
          const price = p.last1hEnergyPrice || Infinity;
          return price < min ? price : min;
        }, Infinity);
        
        log.info(
          `Минимальная цена среди провайдеров с dynamicPriority: true = ${actualMinSunRate}`
        );
        
        // Пересчитываем ожидаемую цену с использованием фактической минимальной цены
        const correctedExpectedPrice = ENERGY_PRICE_FORMULA_DYNAMIC(
          actualMinSunRate,
          1, // hour
          0, // day
          energyAmount,
          dynamicPriceOffset
        );
        
        // Используем скорректированную цену
        expectedPrice = correctedExpectedPrice;

        // Небольшая задержка для применения настроек
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Создаем заказ на 65000 энергии на 1h
        const orderRequest: CreateOrderRequest = {
          type: "ENERGY",
          targetAddress,
          amount: energyAmount,
          period: OrderPeriod.ONE_HOUR,
        };

        log.info(`Создание заказа для провайдера ${provider.name}: ${JSON.stringify(orderRequest, null, 2)}`);

        const orderResponse = await orderApi.createNewOrder(orderRequest);
        responseStatusCheck.checkResponseStatus(orderResponse);

        const apiOrder = (await orderResponse.json()) as Order;
        log.info(`Заказ создан: id=${apiOrder.id}, sellPrice=${apiOrder.sellPrice}`);

        // Получаем фактическую цену из заказа
        const actualPrice =
          typeof apiOrder.sellPrice === "string" ? parseFloat(apiOrder.sellPrice) : apiOrder.sellPrice;

        log.info(`Фактическая цена заказа: ${actualPrice} TRX`);
        log.info(`Ожидаемая цена заказа: ${expectedPrice} TRX`);

        // Проверяем, что цена совпадает с ожидаемой (допустимая погрешность 0.01 TRX)
        const priceDifference = Math.abs(actualPrice - expectedPrice);

        expect(
          priceDifference,
          `[Провайдер ${provider.name}] Цена заказа ${actualPrice} не совпадает с ожидаемой ${expectedPrice} (разница: ${priceDifference})`
        ).toBeLessThanOrEqual(tolerance);

        log.info(
          `✓ [Провайдер ${provider.name}] Цена заказа (${actualPrice}) соответствует ожидаемой (${expectedPrice}), разница: ${priceDifference}`
        );

        // Ждем завершения заказа и проверяем финальную цену
        const dbFinalOrder = await waitForOrderCompleted(apiOrder.id, 90000, 1000);
        log.info(
          `Заказ завершен. Order ID: ${apiOrder.id}, Provider в БД: ${dbFinalOrder.provider}`
        );

        const getOrderResponse = await orderApi.getOrderById(apiOrder.id);
        responseStatusCheck.checkResponseStatus(getOrderResponse);
        const finalOrder = (await getOrderResponse.json()) as Order;

        const finalPrice =
          typeof finalOrder.sellPrice === "string" ? parseFloat(finalOrder.sellPrice) : finalOrder.sellPrice;

        const finalPriceDifference = Math.abs(finalPrice - expectedPrice);
        expect(
          finalPriceDifference,
          `[Провайдер ${provider.name}] Финальная цена заказа ${finalPrice} не совпадает с ожидаемой ${expectedPrice} (разница: ${finalPriceDifference})`
        ).toBeLessThanOrEqual(tolerance);

        log.info(
          `✓ [Провайдер ${provider.name}] Финальная цена заказа (${finalPrice}) соответствует ожидаемой (${expectedPrice}), разница: ${finalPriceDifference}`
        );

        log.info(`✓ Провайдер ${provider.name} проверен успешно\n`);
      }

      log.info(`✓ Все провайдеры (${providersWithPrice.length}) проверены успешно`);
      log.info("✓ Тест проверки динамического приоритета провайдеров завершен успешно");
    } finally {
      // Восстанавливаем начальные значения настроек
      try {
        if (initialDynamicPriceOffset !== null) {
          await coreRepo.setDynamicPriceOffset(userIdPrimary, initialDynamicPriceOffset);
          log.info(
            `DYNAMIC_PRICE_OFFSET восстановлено в начальное состояние: ${initialDynamicPriceOffset}`
          );
        }
      } catch (error) {
        log.error(`Ошибка при восстановлении начального значения DYNAMIC_PRICE_OFFSET: ${error}`);
      }

      try {
        if (initialProviderSettings !== null) {
          await coreRepo.setProviderSettings(userIdPrimary, initialProviderSettings);
          log.info(
            `PROVIDER_SETTINGS восстановлены в начальное состояние: ${JSON.stringify({ value: initialProviderSettings })}`
          );
        }
      } catch (error) {
        log.error(`Ошибка при восстановлении начального значения PROVIDER_SETTINGS: ${error}`);
      }
    }
  });
});
