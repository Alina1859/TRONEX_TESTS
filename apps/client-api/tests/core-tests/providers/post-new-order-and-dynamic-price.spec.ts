import { test } from "@playwright/test";
import { CoreRepository } from "@apps/client-api/api/core.api";
import { OrderApi } from "@apps/client-api/api/order.api";
import { log } from "@shared/utils/logger";
import {
  HttpStatus,
  ENERGY_PRICE_FORMULA_DYNAMIC,
  PROVIDERS,
  DYNAMIC_PRICE_OFFSET_TEST_VALUE,
  PRICE_TOLERANCE,
} from "@shared/utils/constants";
import { userIdPrimary, apiKeyPrimary } from "@apps/client-api/api/constants";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { OrderResponseCheck } from "@apps/client-api/test-objects/order-response-check";
import { OrderFieldCheck } from "@apps/client-api/test-objects/order-field-check";
import { WalletActivationHelper } from "@shared/helpers/wallet-activation-helper";
import { CreateOrderRequest, Order } from "@shared/utils/types";
import { clearProviderSettings, getProviderEnergyPrice } from "@shared/helpers/provider-settings-helper";
import { getPeriodKey, getFormulaParams } from "@shared/helpers/order-period-helpers";
import { DYNAMIC_PRICE_ORDER_COMBINATIONS } from "@shared/utils/variations_constants";

test.describe("Create order with dynamic price POST /api/v2/orders", () => {
  test.describe.configure({ mode: "serial", timeout: 300000 });

  const responseStatusCheck = new ResponseStatusCheck();
  const orderResponseCheck = new OrderResponseCheck();
  const orderFieldCheck = new OrderFieldCheck();
  const coreRepo = new CoreRepository();
  const walletActivationHelper = new WalletActivationHelper();

  test.beforeEach(async () => {
    await test.step("Очистить настройки провайдера", async () => {
      await clearProviderSettings(coreRepo, userIdPrimary);
      log.info(`✅ Настройки провайдера очищены`);
    });

    await test.step("Установить DYNAMIC_PRICE_OFFSET", async () => {
      try {
        await coreRepo.setDynamicPriceOffset(userIdPrimary, DYNAMIC_PRICE_OFFSET_TEST_VALUE);
        log.info(`✅ DYNAMIC_PRICE_OFFSET установлен в ${DYNAMIC_PRICE_OFFSET_TEST_VALUE}`);
      } catch (error) {
        log.error(`Ошибка при установке DYNAMIC_PRICE_OFFSET: ${error}`);
        throw error;
      }
    });
  });

  test.afterEach(async () => {
    await test.step("Очистить настройки провайдера", async () => {
      await clearProviderSettings(coreRepo, userIdPrimary);
      log.info(`✅ Настройки провайдера очищены`);
    });

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

  test.describe("Тест-кейс № 1: Создание комбинаций заказов ENERGY с динамической ценой без приоритета провайдера", () => {
    for (const combination of DYNAMIC_PRICE_ORDER_COMBINATIONS) {
      const { duration, amount } = combination;
      const periodKey = getPeriodKey(duration);
      const { hour, day } = getFormulaParams(duration);

      test(`should create ENERGY order with dynamic price for ${periodKey} period and ${amount} energy`, async ({
        request,
      }) => {
        log.info(
          `=== Тест: Создание заказа ENERGY с динамической ценой, период ${periodKey}, количество ${amount} ===`
        );

        const orderApi = new OrderApi(request);

        const availableProvider = PROVIDERS.find((provider) => {
          const energyConfig = provider.availabilityConfig.ENERGY;
          if (energyConfig === true) return true;
          if (Array.isArray(energyConfig)) {
            return (energyConfig as ReadonlyArray<string>).includes(periodKey);
          }
          return false;
        });

        if (!availableProvider) {
          throw new Error(
            `Не найден провайдер, поддерживающий ENERGY для периода ${periodKey} в конфигурации PROVIDERS`
          );
        }

        const expectedProviderName = availableProvider.name;
        const minSunRate = getProviderEnergyPrice(expectedProviderName);
        const expectedSellPrice = ENERGY_PRICE_FORMULA_DYNAMIC(
          minSunRate,
          hour,
          day,
          amount,
          DYNAMIC_PRICE_OFFSET_TEST_VALUE
        );

        log.info(
          `Ожидаемая цена с динамическим смещением: ${expectedSellPrice} (minSunRate: ${minSunRate}, dynamicPriceOffset: ${DYNAMIC_PRICE_OFFSET_TEST_VALUE}, period: ${periodKey}, amount: ${amount})`
        );

        await test.step("Проверить, что настройки провайдера отсутствуют", async () => {
          const settingsResponse = await coreRepo.coreUsersUserIdSettingsKeyGet({
            userId: userIdPrimary,
            key: "PROVIDER_SETTINGS",
          });

          log.info(
            `Настройки провайдера: ${JSON.stringify(settingsResponse.data, null, 2)}`
          );

          if (settingsResponse.data !== null) {
            log.warn(
              `⚠ Настройки провайдера не пусты, но должны быть очищены в beforeEach. Продолжаем тест.`
            );
          } else {
            log.info(`✅ Настройки провайдера отсутствуют (null)`);
          }
        });

        await test.step("Проверить, что DYNAMIC_PRICE_OFFSET установлен", async () => {
          const dynamicPriceOffsetResponse = await coreRepo.getDynamicPriceOffset(userIdPrimary);
          log.info(
            `DYNAMIC_PRICE_OFFSET: ${JSON.stringify(dynamicPriceOffsetResponse.data, null, 2)}`
          );

          if (dynamicPriceOffsetResponse.data !== DYNAMIC_PRICE_OFFSET_TEST_VALUE) {
            throw new Error(
              `DYNAMIC_PRICE_OFFSET должен быть ${DYNAMIC_PRICE_OFFSET_TEST_VALUE}, но получен ${dynamicPriceOffsetResponse.data}`
            );
          }
          log.info(`✅ DYNAMIC_PRICE_OFFSET установлен корректно: ${dynamicPriceOffsetResponse.data}`);
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
          log.info(`✅ Кошелек активирован: ${address}`);
          return { targetAddress: address };
        });

        const { apiOrder } = await test.step("Создать заказ ENERGY с динамической ценой", async () => {
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

          log.info(`✅ Заказ создан: id=${order.id}, sellPrice=${order.sellPrice}`);

          orderResponseCheck.checkOrderType(order, "ENERGY");
          log.info(`✅ Тип заказа соответствует ожидаемому: ENERGY`);

          const actualSellPrice =
            typeof order.sellPrice === "string" ? parseFloat(order.sellPrice) : order.sellPrice;
          const priceDifference = Math.abs(actualSellPrice - expectedSellPrice);
          if (priceDifference > PRICE_TOLERANCE) {
            throw new Error(
              `Цена заказа из API (${actualSellPrice}) не совпадает с ожидаемой (${expectedSellPrice}), разница: ${priceDifference}`
            );
          }
          log.info(
            `✅ Цена заказа из API (${actualSellPrice}) соответствует ожидаемой (${expectedSellPrice})`
          );

          orderFieldCheck.checkAllFields(order);

          return { apiOrder: order };
        });

        await test.step("Проверить провайдера и цену в базе данных", async () => {
          const dbFinalOrder = await walletActivationHelper.waitForOrderCompleted({
            orderId: apiOrder.id,
          });
          log.info(
            `Заказ завершен. Order ID: ${apiOrder.id}, Provider в БД: ${dbFinalOrder.provider}, sellPrice в БД: ${dbFinalOrder.sellPrice}`
          );

          orderResponseCheck.checkProvider(dbFinalOrder, expectedProviderName);
          log.info(
            `✅ Провайдер в БД (${dbFinalOrder.provider}) соответствует ожидаемому (${expectedProviderName})`
          );

          orderResponseCheck.checkPrice(dbFinalOrder.sellPrice, expectedSellPrice);

          const actualSellPrice =
            typeof dbFinalOrder.sellPrice === "string"
              ? parseFloat(dbFinalOrder.sellPrice)
              : dbFinalOrder.sellPrice;
          log.info(
            `✅ Цена заказа из БД (${actualSellPrice}) соответствует ожидаемой по формуле с динамическим смещением (${expectedSellPrice})`
          );

          const getOrderResponse = await orderApi.getOrderById({ orderId: apiOrder.id });
          responseStatusCheck.checkResponseStatus(getOrderResponse, HttpStatus.OK);
          const apiFinalOrder = (await getOrderResponse.json()) as Order;

          orderFieldCheck.checkAllFields(apiFinalOrder);
          orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);
        });

        log.info(`✅ Тест завершен успешно`);
      });
    }
  });

//   test.describe("Тест-кейс № 2: Создание заказа ENERGY с приоритетом провайдера TronLocal-1 и динамической ценой", () => {
//     test("should create ENERGY order with TronLocal-1 priority and dynamic price for 1d period and 65000 energy", async ({
//       request,
//     }) => {
//       log.info(
//         `=== Тест: Создание заказа ENERGY с приоритетом TronLocal-1 и динамической ценой, период 1d, количество 65000 ===`
//       );

//       const orderApi = new OrderApi(request);
//       const providerName = PROVIDER_NAMES.TRON_LOCAL_1;
//       const period = OrderPeriod.ONE_DAY;
//       const amount = 65000;
//       const periodKey = getPeriodKey(period);
//       const { hour, day } = getFormulaParams(period);
//       const targetAddress = "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh";
//       const minSunRate = getProviderEnergyPrice(providerName);
//       const expectedSellPrice = ENERGY_PRICE_FORMULA_DYNAMIC(
//         minSunRate,
//         hour,
//         day,
//         amount,
//         DYNAMIC_PRICE_OFFSET_TEST_VALUE
//       );
//       log.info(
//         `Параметры формулы: minSunRate=${minSunRate}, hour=${hour}, day=${day}, amount=${amount}, dynamicPriceOffset=${DYNAMIC_PRICE_OFFSET_TEST_VALUE}, expectedSellPrice=${expectedSellPrice}`
//       );

//       await test.step("Установить приоритет провайдера TronLocal-1", async () => {
//         const providerSettings = {
//           [providerName]: {
//             priority: PROVIDER_TEST_PRIORITY,
//           },
//         };

//         log.info(`Установка приоритета провайдера: ${JSON.stringify(providerSettings, null, 2)}`);

//         const priorityResponse = await coreRepo.coreUsersUserIdSettingsKeyPut({
//           userId: userIdPrimary,
//           key: "PROVIDER_SETTINGS",
//           coreUsersUserIdSettingsKeyPutRequest: {
//             value: providerSettings,
//           },
//         });

//         responseStatusCheck.checkResponseStatus(priorityResponse, HttpStatus.OK);
//         log.info(
//           `✅ Приоритет провайдера ${providerName} установлен на ${PROVIDER_TEST_PRIORITY}`
//         );

//         const verifyResponse = await coreRepo.coreUsersUserIdSettingsKeyGet({
//           userId: userIdPrimary,
//           key: "PROVIDER_SETTINGS",
//         });
//         log.info(
//           `Проверка установленного приоритета: ${JSON.stringify(verifyResponse.data, null, 2)}`
//         );

//         providerPriorityCheck.checkProviderPriority(
//           verifyResponse.data,
//           providerName,
//           PROVIDER_TEST_PRIORITY
//         );
//         log.info(`✅ Приоритет провайдера ${providerName} успешно установлен и верифицирован`);
//       });

//       await test.step("Проверить, что DYNAMIC_PRICE_OFFSET установлен", async () => {
//         const dynamicPriceOffsetResponse = await coreRepo.getDynamicPriceOffset(userIdPrimary);
//         log.info(
//           `DYNAMIC_PRICE_OFFSET: ${JSON.stringify(dynamicPriceOffsetResponse.data, null, 2)}`
//         );

//         if (dynamicPriceOffsetResponse.data !== DYNAMIC_PRICE_OFFSET_TEST_VALUE) {
//           throw new Error(
//             `DYNAMIC_PRICE_OFFSET должен быть ${DYNAMIC_PRICE_OFFSET_TEST_VALUE}, но получен ${dynamicPriceOffsetResponse.data}`
//           );
//         }
//         log.info(`✅ DYNAMIC_PRICE_OFFSET установлен корректно: ${dynamicPriceOffsetResponse.data}`);
//       });

//       const { apiOrder } = await test.step("Создать заказ ENERGY с приоритетом провайдера и динамической ценой", async () => {
//         const energyRequest: CreateOrderRequest = {
//           type: "ENERGY",
//           targetAddress: targetAddress,
//           amount: amount,
//           period: period,
//         };

//         log.info(
//           `Отправка запроса на создание заказа: ${JSON.stringify(energyRequest, null, 2)}`
//         );

//         const response = await orderApi.createNewOrder({
//           data: energyRequest,
//           apiKey: apiKeyPrimary,
//         });
//         responseStatusCheck.checkResponseStatus(response, HttpStatus.OK);

//         const order = (await response.json()) as Order;
//         log.info(`API Response: ${JSON.stringify(order, null, 2)}`);

//         log.info(`✅ Заказ создан: id=${order.id}, sellPrice=${order.sellPrice}`);

//         orderResponseCheck.checkOrderType(order, "ENERGY");
//         log.info(`✅ Тип заказа соответствует ожидаемому: ENERGY`);

//         const actualSellPrice =
//           typeof order.sellPrice === "string" ? parseFloat(order.sellPrice) : order.sellPrice;
//         const priceDifference = Math.abs(actualSellPrice - expectedSellPrice);
//         if (priceDifference > PRICE_TOLERANCE) {
//           throw new Error(
//             `Цена заказа из API (${actualSellPrice}) не совпадает с ожидаемой (${expectedSellPrice}), разница: ${priceDifference}`
//           );
//         }
//         log.info(
//           `✅ Цена заказа из API (${actualSellPrice}) соответствует ожидаемой (${expectedSellPrice})`
//         );

//         orderFieldCheck.checkAllFields(order);

//         return { apiOrder: order };
//       });

//       await test.step("Проверить провайдера и цену в базе данных", async () => {
//         log.info(
//           `Ожидаемая цена с динамическим смещением: ${expectedSellPrice} (minSunRate: ${minSunRate}, dynamicPriceOffset: ${DYNAMIC_PRICE_OFFSET_TEST_VALUE}, period: ${periodKey}, amount: ${amount})`
//         );

//         const dbFinalOrder = await walletActivationHelper.waitForOrderCompleted({
//           orderId: apiOrder.id,
//         });
//         log.info(
//           `Заказ завершен. Order ID: ${apiOrder.id}, Provider в БД: ${dbFinalOrder.provider}, sellPrice в БД: ${dbFinalOrder.sellPrice}`
//         );

//         orderResponseCheck.checkProvider(dbFinalOrder, providerName);
//         log.info(
//           `✅ Провайдер в БД (${dbFinalOrder.provider}) соответствует ожидаемому (${providerName})`
//         );

//         const actualSellPrice =
//           typeof dbFinalOrder.sellPrice === "string"
//             ? parseFloat(dbFinalOrder.sellPrice)
//             : dbFinalOrder.sellPrice;
//         const priceDifference = Math.abs(actualSellPrice - expectedSellPrice);
//         if (priceDifference > PRICE_TOLERANCE) {
//           throw new Error(
//             `Цена заказа из БД (${actualSellPrice}) не совпадает с ожидаемой (${expectedSellPrice}), разница: ${priceDifference}`
//           );
//         }
//         log.info(
//           `✅ Цена заказа из БД (${actualSellPrice}) соответствует ожидаемой (${expectedSellPrice})`
//         );

//         const getOrderResponse = await orderApi.getOrderById({ orderId: apiOrder.id });
//         responseStatusCheck.checkResponseStatus(getOrderResponse, HttpStatus.OK);
//         const apiFinalOrder = (await getOrderResponse.json()) as Order;

//         orderFieldCheck.checkAllFields(apiFinalOrder);
//         orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);
//       });

//       log.info(`✅ Тест завершен успешно`);
//     });
//   });
});

