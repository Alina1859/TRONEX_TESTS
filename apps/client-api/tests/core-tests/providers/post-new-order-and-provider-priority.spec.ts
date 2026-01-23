import { test } from "@playwright/test";
import { CoreRepository } from "@apps/client-api/api/core.api";
import { OrderApi } from "@apps/client-api/api/order.api";
import { log } from "@shared/utils/logger";
import {
  HttpStatus,
  ENERGY_PRICE_FORMULA,
  PROVIDER_TEST_PRIORITY,
  OrderPeriod,
  PROVIDER_NAMES,
} from "@shared/utils/constants";
import { userIdPrimary, apiKeyPrimary } from "@apps/client-api/api/constants";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { OrderResponseCheck } from "@apps/client-api/test-objects/order-response-check";
import { OrderFieldCheck } from "@apps/client-api/test-objects/order-field-check";
import { ProviderPriorityCheck } from "@apps/client-api/test-objects/provider-priority-check";
import { WalletActivationHelper } from "@shared/helpers/wallet-activation-helper";
import { CreateOrderRequest, Order } from "@shared/utils/types";
import { PROVIDERS_PRIORITY_ENERGY_ORDER_COMBINATIONS } from "@shared/utils/variations_constants/providers-priority-variations";
import { getPeriodKey, getFormulaParams } from "@shared/helpers/order-period-helpers";
import { clearProviderSettings, getEnergyPrice } from "@shared/helpers/provider-settings-helper";

test.describe("Create order with provider priority POST /api/v2/orders", () => {
  test.describe.configure({ mode: "serial", timeout: 300000 });

  const responseStatusCheck = new ResponseStatusCheck();
  const orderResponseCheck = new OrderResponseCheck();
  const orderFieldCheck = new OrderFieldCheck();
  const providerPriorityCheck = new ProviderPriorityCheck();
  const coreRepo = new CoreRepository();
  const walletActivationHelper = new WalletActivationHelper();

  test.beforeEach(async () => {
    await clearProviderSettings(coreRepo, userIdPrimary);
  });

  test.afterEach(async () => {
    await clearProviderSettings(coreRepo, userIdPrimary);
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

          responseStatusCheck.checkResponseStatus(priorityResponse, HttpStatus.OK);
          log.info(
            `✅ Приоритет провайдера ${providerName} установлен на ${PROVIDER_TEST_PRIORITY}`
          );

          const verifyResponse = await coreRepo.coreUsersUserIdSettingsKeyGet({
            userId: userIdPrimary,
            key: "PROVIDER_SETTINGS",
          });
          log.info(
            `Проверка установленного приоритета: ${JSON.stringify(verifyResponse.data, null, 2)}`
          );

          providerPriorityCheck.checkProviderPriority(
            verifyResponse.data,
            providerName,
            PROVIDER_TEST_PRIORITY
          );
          log.info(`✅ Приоритет провайдера ${providerName} успешно установлен и верифицирован`);
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

          log.info(`✅ Заказ создан: id=${order.id}, sellPrice=${order.sellPrice}`);

          orderFieldCheck.checkAllFields(order);

          return { apiOrder: order };
        });

        await test.step("Проверить цену заказа и провайдера", async () => {
          const sunRate = await getEnergyPrice(coreRepo, userIdPrimary, periodKey);

          const expectedSellPrice = ENERGY_PRICE_FORMULA(sunRate, hour, day, amount);

          const dbFinalOrder = await walletActivationHelper.waitForOrderCompleted({
            orderId: apiOrder.id,
          });
          log.info(
            `Заказ завершен. Order ID: ${apiOrder.id}, Provider в БД: ${dbFinalOrder.provider}, sellPrice в БД: ${dbFinalOrder.sellPrice}`
          );

          orderResponseCheck.checkProvider(dbFinalOrder, providerName);
          log.info(
            `✅ Провайдер в БД (${dbFinalOrder.provider}) соответствует ожидаемому (${providerName})`
          );

          orderResponseCheck.checkPrice(dbFinalOrder.sellPrice, expectedSellPrice);

          const actualSellPrice =
            typeof dbFinalOrder.sellPrice === "string"
              ? parseFloat(dbFinalOrder.sellPrice)
              : dbFinalOrder.sellPrice;
          log.info(
            `✅ Цена заказа из БД (${actualSellPrice}) соответствует ожидаемой по формуле (${expectedSellPrice})`
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

  test("Тест-кейс № 2: Переключение на другой провайдер, если приоритетный не продает опцию", async ({
    request,
  }) => {
      log.info(
        `=== Тест: Переключение провайдера - TronLocal-1 (приоритетный) не поддерживает 1h, должен использоваться TronLocal-2 ===`
      );

      const orderApi = new OrderApi(request);
      const priorityProviderName = PROVIDER_NAMES.TRON_LOCAL_1;
      const expectedProviderName = PROVIDER_NAMES.TRON_LOCAL_2;
      const period = OrderPeriod.ONE_HOUR;
      const amount = 65000;
      const periodKey = getPeriodKey(period);
      const { hour, day } = getFormulaParams(period);

      await test.step("Установить приоритет провайдера TronLocal-1", async () => {
        const providerSettings = {
          [priorityProviderName]: {
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

        responseStatusCheck.checkResponseStatus(priorityResponse, HttpStatus.OK);
        log.info(
          `✅ Приоритет провайдера ${priorityProviderName} установлен на ${PROVIDER_TEST_PRIORITY}`
        );

        const verifyResponse = await coreRepo.coreUsersUserIdSettingsKeyGet({
          userId: userIdPrimary,
          key: "PROVIDER_SETTINGS",
        });
        log.info(
          `Проверка установленного приоритета: ${JSON.stringify(verifyResponse.data, null, 2)}`
        );

        providerPriorityCheck.checkProviderPriority(
          verifyResponse.data,
          priorityProviderName,
          PROVIDER_TEST_PRIORITY
        );
        log.info(
          `✅ Приоритет провайдера ${priorityProviderName} успешно установлен и верифицирован`
        );
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

      const { apiOrder } = await test.step("Создать заказ ENERGY с периодом 1h", async () => {
        const energyRequest: CreateOrderRequest = {
          type: "ENERGY",
          targetAddress: targetAddress,
          amount: amount,
          period: period,
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

        orderFieldCheck.checkAllFields(order);
        return { apiOrder: order };
      });

      await test.step("Проверить, что использован альтернативный провайдер и цена по обычным тарифам", async () => {
        const sunRate = await getEnergyPrice(coreRepo, userIdPrimary, periodKey);
        const expectedSellPrice = ENERGY_PRICE_FORMULA(sunRate, hour, day, amount);

        log.info(
          `Ожидаемая цена по обычным тарифам: ${expectedSellPrice} (sunRate: ${sunRate}, period: ${periodKey}, amount: ${amount})`
        );

        const dbFinalOrder = await walletActivationHelper.waitForOrderCompleted({
          orderId: apiOrder.id,
        });
        log.info(
          `Заказ завершен. Order ID: ${apiOrder.id}, Provider в БД: ${dbFinalOrder.provider}, sellPrice в БД: ${dbFinalOrder.sellPrice}`
        );

        orderResponseCheck.checkProvider(dbFinalOrder, expectedProviderName);
        log.info(
          `✅ Провайдер в БД (${dbFinalOrder.provider}) соответствует ожидаемому (${expectedProviderName}), а не приоритетному (${priorityProviderName})`
        );

        orderResponseCheck.checkPrice(dbFinalOrder.sellPrice, expectedSellPrice);

        const actualSellPrice =
          typeof dbFinalOrder.sellPrice === "string"
            ? parseFloat(dbFinalOrder.sellPrice)
            : dbFinalOrder.sellPrice;
        log.info(
          `✅ Цена заказа из БД (${actualSellPrice}) соответствует ожидаемой по формуле обычных тарифов (${expectedSellPrice})`
        );

        const getOrderResponse = await orderApi.getOrderById({ orderId: apiOrder.id });
        responseStatusCheck.checkResponseStatus(getOrderResponse, HttpStatus.OK);
        const apiFinalOrder = (await getOrderResponse.json()) as Order;

        orderFieldCheck.checkAllFields(apiFinalOrder);
        orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);
      });

      log.info(`✅ Тест завершен успешно`);
  });

  test("Тест-кейс № 3: Создание заказа без приоритета провайдера", async ({
    request,
  }) => {
      log.info(
        `=== Тест: Создание заказа ENERGY без приоритета провайдера - система выберет провайдера по умолчанию ===`
      );

      const orderApi = new OrderApi(request);
      const period = OrderPeriod.ONE_HOUR;
      const amount = 65000;
      const periodKey = getPeriodKey(period);
      const { hour, day } = getFormulaParams(period);

      const availableProviders = [
        PROVIDER_NAMES.TRON_LOCAL_2,
        PROVIDER_NAMES.TRON_LOCAL_3,
        PROVIDER_NAMES.TRON_LOCAL,
      ];

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

      const { apiOrder } = await test.step("Создать заказ ENERGY без приоритета провайдера", async () => {
        const energyRequest: CreateOrderRequest = {
          type: "ENERGY",
          targetAddress: targetAddress,
          amount: amount,
          period: period,
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

        orderFieldCheck.checkAllFields(order);

        return { apiOrder: order };
      });

      await test.step("Проверить, что провайдер выбран системой и цена по обычным тарифам", async () => {
        const sunRate = await getEnergyPrice(coreRepo, userIdPrimary, periodKey);
        const expectedSellPrice = ENERGY_PRICE_FORMULA(sunRate, hour, day, amount);

        log.info(
          `Ожидаемая цена по обычным тарифам: ${expectedSellPrice} (sunRate: ${sunRate}, period: ${periodKey}, amount: ${amount})`
        );

        const dbFinalOrder = await walletActivationHelper.waitForOrderCompleted({
          orderId: apiOrder.id,
        });
        log.info(
          `Заказ завершен. Order ID: ${apiOrder.id}, Provider в БД: ${dbFinalOrder.provider}, sellPrice в БД: ${dbFinalOrder.sellPrice}`
        );

        const actualProvider = dbFinalOrder.provider;
        const isProviderValid = availableProviders.includes(actualProvider as any);

        if (!isProviderValid) {
          throw new Error(
            `Провайдер ${actualProvider} не входит в список доступных провайдеров для периода 1h: ${availableProviders.join(", ")}`
          );
        }

        log.info(
          `✅ Провайдер в БД (${actualProvider}) выбран системой из доступных провайдеров: ${availableProviders.join(", ")}`
        );

        orderResponseCheck.checkPrice(dbFinalOrder.sellPrice, expectedSellPrice);

        const actualSellPrice =
          typeof dbFinalOrder.sellPrice === "string"
            ? parseFloat(dbFinalOrder.sellPrice)
            : dbFinalOrder.sellPrice;
        log.info(
          `✅ Цена заказа из БД (${actualSellPrice}) соответствует ожидаемой по формуле обычных тарифов (${expectedSellPrice})`
        );

        const getOrderResponse = await orderApi.getOrderById({ orderId: apiOrder.id });
        responseStatusCheck.checkResponseStatus(getOrderResponse, HttpStatus.OK);
        const apiFinalOrder = (await getOrderResponse.json()) as Order;

        orderFieldCheck.checkAllFields(apiFinalOrder);
        orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);
      });

      log.info(`✅ Тест завершен успешно`);
  });
});
