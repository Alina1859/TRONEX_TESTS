import { test, expect } from "@playwright/test";
import { CoreRepository } from "@apps/client-api/api/core.api";
import { OrderApi } from "@apps/client-api/api/order.api";
import { log } from "@shared/utils/logger";
import { HTTP_STATUS_OK, OrderPeriod, ENERGY_PRICE_FORMULA } from "@shared/utils/constants";
import { userIdPrimary, apiKeyPrimary } from "@apps/client-api/api/constants";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { OrderResponseCheck } from "@apps/client-api/test-objects/order-response-check";
import { OrderFieldCheck } from "@apps/client-api/test-objects/order-field-check";
import {
  createActivatedWallet,
  waitForActivationCompleted,
  waitForOrderCompleted,
} from "@shared/utils/activate-wallets";
import { CreateOrderRequest, Order, EnergyPriceValues } from "@shared/utils/types";
import { PROVIDERS_PRIORITY_ENERGY_ORDER_COMBINATIONS } from "@shared/utils/variations_constants/providers-priority-variations";

test.describe("Create order with provider priority", () => {
  const responseStatusCheck = new ResponseStatusCheck();
  const orderResponseCheck = new OrderResponseCheck();
  const orderFieldCheck = new OrderFieldCheck();

  // Вспомогательная функция для получения периода в формате строки
  const getPeriodKey = (period: OrderPeriod): "1h" | "1d" | "3d" => {
    if (period === OrderPeriod.ONE_HOUR) return "1h";
    if (period === OrderPeriod.ONE_DAY) return "1d";
    if (period === OrderPeriod.THREE_DAYS) return "3d";
    throw new Error(`Unsupported period: ${period}`);
  };

  const getFormulaParams = (period: OrderPeriod): { hour: number; day: number } => {
    if (period === OrderPeriod.ONE_HOUR) return { hour: 1, day: 0 };
    if (period === OrderPeriod.ONE_DAY) return { hour: 1, day: 0 }; 
    if (period === OrderPeriod.THREE_DAYS) return { hour: 3, day: 0 };
    throw new Error(`Unsupported period: ${period}`);
  };

  for (const combination of PROVIDERS_PRIORITY_ENERGY_ORDER_COMBINATIONS) {
    const { duration, amount, providerName } = combination;
    const periodKey = getPeriodKey(duration);
    const { hour, day } = getFormulaParams(duration);

    test(`should create ENERGY order with ${providerName} priority for ${periodKey} period and ${amount} energy`, async ({
      request,
    }) => {
      test.setTimeout(300000);
      log.info(
        `=== Тест: Создание заказа ENERGY с приоритетом ${providerName}, период ${periodKey}, количество ${amount} ===`
      );

      const coreRepo = new CoreRepository();
      const orderApi = new OrderApi(request);

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
        // Устанавливаем приоритет для указанного провайдера на 100 (делаем его приоритетным)
        const priorityValue = 100;
        const providerSettings = {
          [providerName]: {
            priority: priorityValue,
          },
        };

        log.info(
          `Установка приоритета провайдера: ${JSON.stringify(providerSettings, null, 2)}`
        );

        const priorityResponse = await coreRepo.coreUsersUserIdSettingsKeyPut(
          userIdPrimary,
          "PROVIDER_SETTINGS",
          {
            value: providerSettings,
          }
        );

        log.info(`✓ Приоритет провайдера ${providerName} установлен на ${priorityValue}`);

        // Проверяем, что приоритет установлен правильно
        const verifyResponse = await coreRepo.coreUsersUserIdSettingsKeyGet(
          userIdPrimary,
          "PROVIDER_SETTINGS"
        );
        const verifyData = verifyResponse.data;
        log.info(`Проверка установленного приоритета: ${JSON.stringify(verifyData, null, 2)}`);

        expect(verifyData[providerName]?.priority).toBe(priorityValue);
        log.info(`✓ Приоритет провайдера ${providerName} успешно установлен и верифицирован`);

        // Создаем и активируем кошелек
        const { wallet, activationOrder } = await createActivatedWallet(request, responseStatusCheck);
        const targetAddress = wallet.address?.base58 || "";
        await waitForActivationCompleted(activationOrder.id, targetAddress, 30000, 1000);

        log.info(`✓ Кошелек активирован: ${targetAddress}`);

        // Создаем заказ ENERGY с указанными параметрами
        const energyRequest: CreateOrderRequest = {
          type: "ENERGY",
          targetAddress: targetAddress,
          amount: amount,
          period: duration,
        };

        log.info(`Отправка запроса на создание заказа: ${JSON.stringify(energyRequest, null, 2)}`);

        const response = await orderApi.createNewOrderWithApiKey(energyRequest, apiKeyPrimary);
        responseStatusCheck.checkResponseStatus(response, HTTP_STATUS_OK);

        const apiOrder = (await response.json()) as Order;
        log.info(`API Response: ${JSON.stringify(apiOrder, null, 2)}`);

        // Проверяем поля ответа
        expect(apiOrder.type).toBe("ENERGY");
        expect(apiOrder.amount).toBe(amount);
        expect(apiOrder.period).toBe(duration);
        expect(apiOrder.targetAddress).toBe(targetAddress);
        expect(apiOrder.status).toBe("INIT");
        expect(apiOrder.sellPrice).toBeDefined();
        expect(typeof apiOrder.sellPrice === "number" || typeof apiOrder.sellPrice === "string").toBe(
          true
        );

        log.info(`✓ Заказ создан: id=${apiOrder.id}, sellPrice=${apiOrder.sellPrice}`);

        // Проверяем все поля заказа
        orderFieldCheck.checkAllFields(apiOrder);

        // Получаем sunRate из PRICE_ENERGY для расчета ожидаемой цены
        const priceEnergyResponse = await coreRepo.coreConstantsKeyGet("PRICE_ENERGY");
        const priceEnergyData = priceEnergyResponse.data as EnergyPriceValues;
        const sunRate = priceEnergyData[periodKey];

        log.info(`Получен sunRate для периода ${periodKey} из PRICE_ENERGY: ${sunRate}`);

        // Вычисляем ожидаемую цену по формуле ENERGY_PRICE_FORMULA
        const expectedSellPrice = ENERGY_PRICE_FORMULA(sunRate, hour, day, amount);

        log.info(
          `Ожидаемая цена (sellPrice) по формуле: ${expectedSellPrice} TRX (sunRate=${sunRate}, energy=${amount}, period=${periodKey})`
        );

        // Ждем завершения заказа и проверяем провайдера в БД
        const dbFinalOrder = await waitForOrderCompleted(apiOrder.id);
        log.info(
          `Заказ завершен. Order ID: ${apiOrder.id}, Provider в БД: ${dbFinalOrder.provider}, sellPrice в БД: ${dbFinalOrder.sellPrice}`
        );

        // Ожидаемый результат: provider должен соответствовать указанному провайдеру
        expect(dbFinalOrder.provider).toBe(providerName);
        log.info(
          `✓ Провайдер в БД (${dbFinalOrder.provider}) соответствует ожидаемому (${providerName})`
        );

        // Проверяем sellPrice из БД с ожидаемым значением по формуле
        const actualSellPrice =
          typeof dbFinalOrder.sellPrice === "string"
            ? parseFloat(dbFinalOrder.sellPrice)
            : dbFinalOrder.sellPrice;

        log.info(`Фактическая цена из БД: ${actualSellPrice} TRX`);
        log.info(`Ожидаемая цена по формуле: ${expectedSellPrice} TRX`);

        const priceDifference = Math.abs(actualSellPrice - expectedSellPrice);
        const tolerance = 0.01; // Допустимая погрешность 0.01 TRX

        expect(
          priceDifference,
          `Цена заказа из БД (${actualSellPrice}) не совпадает с ожидаемой по формуле (${expectedSellPrice}), разница: ${priceDifference}`
        ).toBeLessThanOrEqual(tolerance);

        log.info(
          `✓ Цена заказа из БД (${actualSellPrice}) соответствует ожидаемой по формуле (${expectedSellPrice}), разница: ${priceDifference}`
        );

        // Проверяем финальный заказ через API
        const getOrderResponse = await orderApi.getOrderById(apiOrder.id);
        responseStatusCheck.checkResponseStatus(getOrderResponse, HTTP_STATUS_OK);
        const apiFinalOrder = (await getOrderResponse.json()) as Order;

        orderFieldCheck.checkAllFields(apiFinalOrder);
        orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);

        log.info(`✓ Тест завершен успешно`);
      } finally {
        // Восстанавливаем начальные настройки провайдера
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
  }
});
