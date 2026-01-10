import { test, expect } from "@playwright/test";
import { CoreRepository } from "@apps/client-api/api/core.api";
import { OrderApi } from "@apps/client-api/api/order.api";
import { log } from "@shared/utils/logger";
import { HTTP_STATUS_OK, OrderPeriod, ENERGY_PRICE_FORMULA, PROVIDER_TEST_PRIORITY } from "@shared/utils/constants";
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
import { getPeriodKey, getFormulaParams } from "@shared/helpers/order-period-helpers";

test.describe("Create order with provider priority POST /api/v2/orders", () => {
  test.describe.configure({ mode: 'serial', timeout: 300000 });

  const responseStatusCheck = new ResponseStatusCheck();
  const orderResponseCheck = new OrderResponseCheck();
  const orderFieldCheck = new OrderFieldCheck();
  const coreRepo = new CoreRepository();

  test.beforeEach(async () => {
    await test.step("Удалить все настройки провайдеров", async () => {
      try {
        await coreRepo.coreUsersUserIdSettingsKeyPut(userIdPrimary, "PROVIDER_SETTINGS", {
          value: null,
        });
        log.info(`✓ Все настройки провайдеров удалены (value: null)`);
      } catch (error) {
        log.error(`Ошибка при удалении настроек провайдеров: ${error}`);
        throw error;
      }
    });
  });

  test.afterEach(async () => {
    await test.step("Удалить все настройки провайдеров", async () => {
      try {
        await coreRepo.coreUsersUserIdSettingsKeyPut(userIdPrimary, "PROVIDER_SETTINGS", {
          value: null,
        });
        log.info(`✓ Все настройки провайдеров удалены (value: null)`);
      } catch (error) {
        log.error(`Ошибка при удалении настроек провайдеров: ${error}`);
        throw error;
      }
    });
  });

  test.describe("Тест-кейс № 1: Создание заказа ENERGY с приоритетом провайдера", () => {
    for (const combination of PROVIDERS_PRIORITY_ENERGY_ORDER_COMBINATIONS) {
      const { duration, amount, providerName } = combination;
      const periodKey = getPeriodKey(duration);
      const { hour, day } = getFormulaParams(duration);

      test(`should create ENERGY order with ${providerName} priority for ${periodKey} period and ${amount} energy`, async ({
        request,
      }) => {
        log.info(
          `=== Тест: Создание заказа ENERGY с приоритетом ${providerName}, период ${periodKey}, количество ${amount} ===`
        );

        const orderApi = new OrderApi(request);

        await test.step("Установить приоритет провайдера", async () => {
          const providerSettings = {
            [providerName]: {
              priority: PROVIDER_TEST_PRIORITY,
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

          log.info(`✓ Приоритет провайдера ${providerName} установлен на ${PROVIDER_TEST_PRIORITY}`);

          // Проверяем, что приоритет установлен правильно
          const verifyResponse = await coreRepo.coreUsersUserIdSettingsKeyGet(
            userIdPrimary,
            "PROVIDER_SETTINGS"
          );
          const verifyData = verifyResponse.data;
          log.info(`Проверка установленного приоритета: ${JSON.stringify(verifyData, null, 2)}`);

          expect(verifyData[providerName]?.priority).toBe(PROVIDER_TEST_PRIORITY);
          log.info(`✓ Приоритет провайдера ${providerName} успешно установлен и верифицирован`);
        });

        const { targetAddress } = await test.step("Создать и активировать кошелек", async () => {
          const { wallet, activationOrder } = await createActivatedWallet(request, responseStatusCheck);
          const address = wallet.address?.base58 || "";
          await waitForActivationCompleted(activationOrder.id, address, 30000, 1000);
          log.info(`✓ Кошелек активирован: ${address}`);
          return { targetAddress: address };
        });

        const { apiOrder } = await test.step("Создать заказ ENERGY", async () => {
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

          const order = (await response.json()) as Order;
          log.info(`API Response: ${JSON.stringify(order, null, 2)}`);

          // Проверяем поля ответа
          expect(order.type).toBe("ENERGY");
          expect(order.amount).toBe(amount);
          expect(order.period).toBe(duration);
          expect(order.targetAddress).toBe(targetAddress);
          expect(order.status).toBe("INIT");
          expect(order.sellPrice).toBeDefined();
          expect(typeof order.sellPrice === "number" || typeof order.sellPrice === "string").toBe(
            true
          );

          log.info(`✓ Заказ создан: id=${order.id}, sellPrice=${order.sellPrice}`);

          // Проверяем все поля заказа
          orderFieldCheck.checkAllFields(order);

          return { apiOrder: order };
        });

        await test.step("Проверить цену заказа и провайдера", async () => {
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
        });

        log.info(`✓ Тест завершен успешно`);
      });
    }
  });
});
