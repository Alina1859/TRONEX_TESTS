import { test, expect } from "@playwright/test";
import { CoreRepository } from "@apps/client-api/api/core.api";
import { OrderApi } from "@apps/client-api/api/order.api";
import { log } from "@shared/utils/logger";
import {
  HttpStatus,
  OrderPeriod,
  ENERGY_PRICE_FORMULA,
  PROVIDER_TEST_PRIORITY,
} from "@shared/utils/constants";
import { userIdPrimary, apiKeyPrimary } from "@apps/client-api/api/constants";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { OrderResponseCheck } from "@apps/client-api/test-objects/order-response-check";
import { OrderFieldCheck } from "@apps/client-api/test-objects/order-field-check";
import { WalletActivationHelper } from "@shared/helpers/wallet-activation-helper";
import { CreateOrderRequest, Order, EnergyPriceValues } from "@shared/utils/types";
import { PROVIDERS_PRIORITY_ENERGY_ORDER_COMBINATIONS } from "@shared/utils/variations_constants/providers-priority-variations";
import { getPeriodKey, getFormulaParams } from "@shared/helpers/order-period-helpers";

test.describe("Create order with provider priority POST /api/v2/orders", () => {
  test.describe.configure({ mode: "serial", timeout: 300000 });

  const responseStatusCheck = new ResponseStatusCheck();
  const orderResponseCheck = new OrderResponseCheck();
  const orderFieldCheck = new OrderFieldCheck();
  const coreRepo = new CoreRepository();
  const walletActivationHelper = new WalletActivationHelper();

  test.beforeEach(async () => {
    await test.step("Удалить все настройки провайдеров", async () => {
      try {
        await coreRepo.coreUsersUserIdSettingsKeyPut({
          userId: userIdPrimary,
          key: "PROVIDER_SETTINGS",
          coreUsersUserIdSettingsKeyPutRequest: {
            value: null,
          },
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
        await coreRepo.coreUsersUserIdSettingsKeyPut({
          userId: userIdPrimary,
          key: "PROVIDER_SETTINGS",
          coreUsersUserIdSettingsKeyPutRequest: {
            value: null,
          },
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

          log.info(`Установка приоритета провайдера: ${JSON.stringify(providerSettings, null, 2)}`);

          const priorityResponse = await coreRepo.coreUsersUserIdSettingsKeyPut({
            userId: userIdPrimary,
            key: "PROVIDER_SETTINGS",
            coreUsersUserIdSettingsKeyPutRequest: {
              value: providerSettings,
            },
          });

          log.info(
            `✓ Приоритет провайдера ${providerName} установлен на ${PROVIDER_TEST_PRIORITY}`
          );

          const verifyResponse = await coreRepo.coreUsersUserIdSettingsKeyGet({
            userId: userIdPrimary,
            key: "PROVIDER_SETTINGS",
          });
          log.info(
            `Проверка установленного приоритета: ${JSON.stringify(verifyResponse.data, null, 2)}`
          );

          expect(verifyResponse.data[providerName]?.priority).toBe(PROVIDER_TEST_PRIORITY);
          log.info(`✓ Приоритет провайдера ${providerName} успешно установлен и верифицирован`);
        });

        const { targetAddress } = await test.step("Создать и активировать кошелек", async () => {
          const { wallet, activationOrder } = await walletActivationHelper.createActivatedWallet(
            request,
            responseStatusCheck
          );
          const address = wallet.address?.base58 || "";
          await walletActivationHelper.waitForActivationCompleted({
            orderId: activationOrder.id,
            targetAddress: address,
            timeoutMs: 30000,
            stepMs: 1000,
          });
          log.info(`✓ Кошелек активирован: ${address}`);
          return { targetAddress: address };
        });

        const { apiOrder } = await test.step("Создать заказ ENERGY", async () => {
          const energyRequest: CreateOrderRequest = {
            type: "ENERGY",
            targetAddress: targetAddress,
            amount: amount,
            period: duration,
          };

          log.info(
            `Отправка запроса на создание заказа: ${JSON.stringify(energyRequest, null, 2)}`
          );

          const response = await orderApi.createNewOrder({
            data: energyRequest,
            apiKey: apiKeyPrimary,
          });
          responseStatusCheck.checkResponseStatus(response, HttpStatus.OK);

          const order = (await response.json()) as Order;
          log.info(`API Response: ${JSON.stringify(order, null, 2)}`);

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

          orderFieldCheck.checkAllFields(order);

          return { apiOrder: order };
        });

        await test.step("Проверить цену заказа и провайдера", async () => {
          // Проверяем PRICE_ENERGY пользователя (если установлен), иначе используем глобальный
          let sunRate: number;
          try {
            const userPriceEnergyResponse = await coreRepo.coreUsersUserIdSettingsKeyGet({
              userId: userIdPrimary,
              key: "PRICE_ENERGY",
            });
            if (userPriceEnergyResponse.data) {
              sunRate = (userPriceEnergyResponse.data as EnergyPriceValues)[periodKey];
            } else {
              const globalPriceEnergyResponse = await coreRepo.coreConstantsKeyGet({
                key: "PRICE_ENERGY",
              });
              sunRate = (globalPriceEnergyResponse.data as EnergyPriceValues)[periodKey];
            }
          } catch (error) {
            const globalPriceEnergyResponse = await coreRepo.coreConstantsKeyGet({
              key: "PRICE_ENERGY",
            });
            sunRate = (globalPriceEnergyResponse.data as EnergyPriceValues)[periodKey];
          }

          const expectedSellPrice = ENERGY_PRICE_FORMULA(sunRate, hour, day, amount);

          const dbFinalOrder = await walletActivationHelper.waitForOrderCompleted({
            orderId: apiOrder.id,
          });
          log.info(
            `Заказ завершен. Order ID: ${apiOrder.id}, Provider в БД: ${dbFinalOrder.provider}, sellPrice в БД: ${dbFinalOrder.sellPrice}`
          );

          expect(dbFinalOrder.provider).toBe(providerName);
          log.info(
            `✓ Провайдер в БД (${dbFinalOrder.provider}) соответствует ожидаемому (${providerName})`
          );

          const actualSellPrice =
            typeof dbFinalOrder.sellPrice === "string"
              ? parseFloat(dbFinalOrder.sellPrice)
              : dbFinalOrder.sellPrice;

          const priceDifference = Math.abs(actualSellPrice - expectedSellPrice);
          const tolerance = 0.01;

          expect(
            priceDifference,
            `Цена заказа из БД (${actualSellPrice}) не совпадает с ожидаемой по формуле (${expectedSellPrice}), разница: ${priceDifference}`
          ).toBeLessThanOrEqual(tolerance);

          log.info(
            `✓ Цена заказа из БД (${actualSellPrice}) соответствует ожидаемой по формуле (${expectedSellPrice})`
          );

          const getOrderResponse = await orderApi.getOrderById({ orderId: apiOrder.id });
          responseStatusCheck.checkResponseStatus(getOrderResponse, HttpStatus.OK);
          const apiFinalOrder = (await getOrderResponse.json()) as Order;

          orderFieldCheck.checkAllFields(apiFinalOrder);
          orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);
        });

        log.info(`✓ Тест завершен успешно`);
      });
    }
  });
});
