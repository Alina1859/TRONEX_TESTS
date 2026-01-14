import { test } from "@playwright/test";
import { createWallet } from "@apps/client-api/repositories/tronweb";
import { log } from "@shared/utils/logger";
import { OrderFieldCheck } from "@apps/client-api/test-objects/order-field-check";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { OrderResponseCheck } from "@apps/client-api/test-objects/order-response-check";
import {
  CreateActivationOrderRequest,
  CreateOrderRequest,
  BandwidthOrderPeriodMs,
  BandwidthPriceValues,
  EnergyOrderPeriodMs,
  EnergyPriceValues,
  Order,
  EnergyPurchaseCombination,
  BandwidthPurchaseCombination,
} from "@shared/utils/types";
import { OrderApi } from "@apps/client-api/api/order.api";
import { WalletActivationHelper } from "@shared/helpers/wallet-activation-helper";
import { PriceCheck } from "@apps/client-api/test-objects/price-check";
import {
  BANDWIDTH_AMOUNT_DEFAULT,
  ENERGY_AMOUNT_DEFAULT,
  HttpStatus,
  OrderPeriod,
  OrderType,
  ENERGY_PRICE_FORMULA,
  BANDWIDTH_PRICE_FORMULA,
} from "@shared/utils/constants";
import { invalidCreateOrderRequestVariations } from "@shared/utils/variations_constants/invalid-create-order-request-variations";
import { ENERGY_PURCHASE_COMBINATIONS } from "@shared/utils/variations_constants/energy-purchase-combinations";
import { ENERGY_PURCHASE_COMBINATIONS_FOR_USER } from "@shared/utils/variations_constants/energy-purchase-combinations-for-user";
import { BANDWIDTH_PURCHASE_COMBINATIONS } from "@shared/utils/variations_constants/bandwidth-purchase-combinations";
import { CoreRepository } from "@apps/client-api/api/core.api";
import { userIdPrimary, apiKeyZero, apiUrl, apiKeyPrimary } from "@apps/client-api/api/constants";
import { getPostHeaders } from "@shared/utils/headers";
import {
  getFormulaParams,
  parseBandwidthDuration,
  parseEnergyDuration,
} from "@shared/helpers/order-period-helpers";

test.describe("Create new order POST /api/v2/orders/", () => {
  const orderFieldCheck = new OrderFieldCheck();
  const orderResponseCheck = new OrderResponseCheck();
  const statusCheck = new ResponseStatusCheck();
  const walletActivationHelper = new WalletActivationHelper();

  test("Тест-кейс № 1: Проверка создания нового заказа и валидации полей ответа", async ({
    request,
  }) => {
    log.info("=== Тест: Создание нового заказа ===");
    const orderApi = new OrderApi(request);
    const { wallet, activationOrder } = await walletActivationHelper.createActivatedWallet(
      request,
      statusCheck
    );
    await walletActivationHelper.waitForActivationCompleted({
      orderId: activationOrder.id,
      targetAddress: wallet.address?.base58 || "",
      timeoutMs: 30000,
      stepMs: 1000,
    });

    const energyRequest: CreateOrderRequest = {
      type: OrderType.ENERGY,
      targetAddress: wallet.address?.base58 || "",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    };

    const response = await orderApi.createNewOrder({ data: energyRequest });

    statusCheck.checkResponseStatus(response);

    const apiOrder = (await response.json()) as Order;
    log.info(`API Response (ENERGY): ${JSON.stringify(apiOrder, null, 2)}`);

    orderFieldCheck.checkAllFields(apiOrder);

    const dbFinalOrder = await walletActivationHelper.waitForOrderCompleted({
      orderId: apiOrder.id,
    });
    const getOrderResponse = await orderApi.getOrderById({ orderId: apiOrder.id });
    statusCheck.checkResponseStatus(getOrderResponse);
    const apiFinalOrder = (await getOrderResponse.json()) as Order;
    log.info(`API Response (ENERGY, by id): ${JSON.stringify(apiFinalOrder, null, 2)}`);
    log.info(
      `Финальный статус заказа по API: ${apiFinalOrder.status} (orderId=${apiFinalOrder.id})`
    );

    orderFieldCheck.checkAllFields(apiFinalOrder);
    orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);

    log.info("✓ Все проверки полей ответа после создания заказа пройдены");
  });

  test.describe("Тест-кейс № 2: Проверка невалидных значений в запросе", () => {
    for (const variation of invalidCreateOrderRequestVariations) {
      test(`should reject invalid request: ${variation.description}`, async ({ request }) => {
        const orderApi = new OrderApi(request);

        const response = await orderApi.createNewOrder({ data: variation.data });
        statusCheck.checkResponseStatus(response, HttpStatus.BAD_REQUEST);

        const headers = response.headers();
        const contentType = headers["content-type"] ?? headers["Content-Type"] ?? "";

        if (contentType.includes("application/json")) {
          const jsonBody = await response.json().catch(() => undefined);
          log.info(`Error response JSON: ${JSON.stringify(jsonBody, null, 2)}`);
        } else {
          const textBody = await response.text().catch(() => "");
          log.info(`Error response text: ${textBody}`);
        }
      });
    }
  });

  test("Тест-кейс № 3: Создание одного заказа с type = ENERGY", async ({ request }) => {
    const orderApi = new OrderApi(request);
    const coreRepo = new CoreRepository();

    const { wallet, activationOrder } = await walletActivationHelper.createActivatedWallet(
      request,
      statusCheck
    );
    const targetAddress = wallet.address?.base58 || "";
    await walletActivationHelper.waitForActivationCompleted({
      orderId: activationOrder.id,
      targetAddress,
      timeoutMs: 30000,
      stepMs: 1000,
    });

    const energyRequest: CreateOrderRequest = {
      type: OrderType.ENERGY,
      targetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    };

    const response = await orderApi.createNewOrder({ data: energyRequest });
    statusCheck.checkResponseStatus(response);

    const apiOrder = (await response.json()) as Order;
    log.info(`API Response (ENERGY): ${JSON.stringify(apiOrder, null, 2)}`);

    orderFieldCheck.checkAllFields(apiOrder);

    const dbFinalOrder = await walletActivationHelper.waitForOrderCompleted({
      orderId: apiOrder.id,
    });
    const getOrderResponse = await orderApi.getOrderById({ orderId: apiOrder.id });
    statusCheck.checkResponseStatus(getOrderResponse);
    const apiFinalOrder = (await getOrderResponse.json()) as Order;

    orderFieldCheck.checkAllFields(apiFinalOrder);
    orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);

    const priceCheck = new PriceCheck(coreRepo, apiFinalOrder);
    await priceCheck.checkEnergyOrderPriceByFormula({
      period: OrderPeriod.ONE_HOUR,
      energyAmount: ENERGY_AMOUNT_DEFAULT,
    });
  });

  test("Тест-кейс № 4: Создание заказа с type = BANDWIDTH", async ({ request }) => {
    const orderApi = new OrderApi(request);
    const coreRepo = new CoreRepository();

    const { wallet, activationOrder } = await walletActivationHelper.createActivatedWallet(
      request,
      statusCheck
    );
    const targetAddress = wallet.address?.base58 || "";
    await walletActivationHelper.waitForActivationCompleted({
      orderId: activationOrder.id,
      targetAddress,
      timeoutMs: 30000,
      stepMs: 1000,
    });

    const bandwidthRequest: CreateOrderRequest = {
      type: OrderType.BANDWIDTH,
      targetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    };

    const response = await orderApi.createNewOrder({ data: bandwidthRequest });
    statusCheck.checkResponseStatus(response);

    const apiOrder = (await response.json()) as Order;
    log.info(`API Response (BANDWIDTH): ${JSON.stringify(apiOrder, null, 2)}`);

    orderFieldCheck.checkAllFields(apiOrder);

    const dbFinalOrder = await walletActivationHelper.waitForOrderCompleted({
      orderId: apiOrder.id,
    });
    const getOrderResponse = await orderApi.getOrderById({ orderId: apiOrder.id });
    statusCheck.checkResponseStatus(getOrderResponse);
    const apiFinalOrder = (await getOrderResponse.json()) as Order;

    orderFieldCheck.checkAllFields(apiFinalOrder);
    orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);

    const priceCheck = new PriceCheck(coreRepo, apiFinalOrder);
    await priceCheck.checkBandwidthOrderPriceByFormula({
      period: OrderPeriod.ONE_HOUR,
      bandwidthAmount: BANDWIDTH_AMOUNT_DEFAULT,
    });
  });

  test("Тест-кейс № 5: Создание заказа с type = ACTIVATION, активированный кошелек", async ({
    request,
  }) => {
    const orderApi = new OrderApi(request);

    const { wallet, activationOrder } = await walletActivationHelper.createActivatedWallet(
      request,
      statusCheck
    );
    const targetAddress = wallet.address?.base58 || "";
    await walletActivationHelper.waitForActivationCompleted({
      orderId: activationOrder.id,
      targetAddress,
      timeoutMs: 30000,
      stepMs: 1000,
    });

    const secondActivationRequest: CreateActivationOrderRequest = {
      type: OrderType.ACTIVATION,
      targetAddress,
    };

    const response = await orderApi.createNewOrder({ data: secondActivationRequest });
    statusCheck.checkResponseStatus(response, HttpStatus.BAD_REQUEST);

    const headers = response.headers();
    const contentType = headers["content-type"] ?? headers["Content-Type"] ?? "";

    if (contentType.includes("application/json")) {
      const jsonBody = await response.json().catch(() => undefined);
      log.info(`Repeat ACTIVATION error response JSON: ${JSON.stringify(jsonBody, null, 2)}`);
    } else {
      const textBody = await response.text().catch(() => "");
      log.info(`Repeat ACTIVATION error response text: ${textBody}`);
    }
  });

  test("Тест-кейс № 6: Создание заказа с type = ACTIVATION, неактивированный кошелек", async ({
    request,
  }) => {
    const orderApi = new OrderApi(request);

    const wallet = await createWallet();
    const targetAddress = wallet.address?.base58 || "";

    const activationRequest: CreateActivationOrderRequest = {
      type: OrderType.ACTIVATION,
      targetAddress,
    };

    const response = await orderApi.createNewOrder({ data: activationRequest });
    statusCheck.checkResponseStatus(response);

    const apiOrder = (await response.json()) as Order;
    log.info(`API Response (ACTIVATION): ${JSON.stringify(apiOrder, null, 2)}`);

    orderFieldCheck.checkAllFields(apiOrder);

    const dbFinalOrder = await walletActivationHelper.waitForActivationCompleted({
      orderId: apiOrder.id,
      targetAddress,
      timeoutMs: 30000,
      stepMs: 1000,
    });
    const getOrderResponse = await orderApi.getOrderById({ orderId: apiOrder.id });
    statusCheck.checkResponseStatus(getOrderResponse);
    const apiFinalOrder = (await getOrderResponse.json()) as Order;

    orderFieldCheck.checkAllFields(apiFinalOrder);
    orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);
  });

  test.describe("Тест-кейс № 7: Создание заказов с различными комбинациями энергии, периодов и цен для PRICE_ENERGY", () => {
    const combinations = ENERGY_PURCHASE_COMBINATIONS;
    log.info(`Найдено ${combinations.length} комбинаций для тестирования`);

    for (const combo of combinations) {
      test(`should create order with energy=${combo.energy}, period=${combo.duration}, sunRate=${combo.sunRate}`, async ({
        request,
      }) => {
        test.setTimeout(300000);
        const period = parseEnergyDuration(combo.duration);
        const { hour, day } = getFormulaParams(period);
        const expectedCost = ENERGY_PRICE_FORMULA(combo.sunRate, hour, day, combo.energy);
        log.info(
          `=== Тест: Создание заказа ENERGY (период=${combo.duration}, энергия=${combo.energy}, курс SUN=${combo.sunRate}, ожидаемая стоимость=${expectedCost} TRX) ===`
        );

        const orderApi = new OrderApi(request);
        const coreRepo = new CoreRepository();

        const { wallet, activationOrder } = await walletActivationHelper.createActivatedWallet(
          request,
          statusCheck
        );
        const targetAddress = wallet.address?.base58 || "";
        await walletActivationHelper.waitForActivationCompleted({
          orderId: activationOrder.id,
          targetAddress,
          timeoutMs: 30000,
          stepMs: 1000,
        });

        const initialPriceResponse = await coreRepo.coreConstantsKeyGet({ key: "PRICE_ENERGY" });
        const initialPriceEnergy: EnergyPriceValues = { ...initialPriceResponse.data };
        log.info(
          `Начальное значение PRICE_ENERGY сохранено: ${JSON.stringify(initialPriceEnergy)}`
        );

        try {
          const currentPriceResponse = await coreRepo.coreConstantsKeyGet({ key: "PRICE_ENERGY" });

          const priceValues: EnergyPriceValues = {
            "1h": currentPriceResponse.data["1h"],
            "1d": currentPriceResponse.data["1d"],
            "3d": currentPriceResponse.data["3d"],
            "7d": currentPriceResponse.data["7d"],
            "14d": currentPriceResponse.data["14d"],
          };

          priceValues[combo.duration] = combo.sunRate;

          await coreRepo.coreConstantsKeyPut({
            key: "PRICE_ENERGY",
            coreUsersUserIdSettingsKeyPutRequest: { value: priceValues },
          });
          log.info(`PRICE_ENERGY установлен: ${JSON.stringify({ value: priceValues })}`);

          const verifyResponse = await coreRepo.coreConstantsKeyGet({ key: "PRICE_ENERGY" });
          const actualValue = verifyResponse.data[combo.duration];

          if (actualValue !== combo.sunRate) {
            throw new Error(
              `PRICE_ENERGY не установлен корректно. Ожидалось: ${combo.sunRate}, получено: ${actualValue}`
            );
          }
          log.info(`PRICE_ENERGY проверен: ${combo.duration} = ${actualValue}`);
        } catch (error) {
          log.error(`Ошибка при установке PRICE_ENERGY: ${error}`);
          throw error;
        }

        const energyRequest: CreateOrderRequest = {
          type: OrderType.ENERGY,
          targetAddress,
          amount: combo.energy,
          period: period,
        };

        log.info(
          `Отправка запроса на создание заказа ENERGY: ${JSON.stringify(energyRequest, null, 2)}`
        );
        const response = await orderApi.createNewOrder({ data: energyRequest });
        statusCheck.checkResponseStatus(response);

        const apiOrder = (await response.json()) as Order;
        log.info(`Получен ответ от API (ENERGY): ${JSON.stringify(apiOrder, null, 2)}`);
        log.info(
          `Заказ создан: id=${apiOrder.id}, стоимость=${apiOrder.sellPrice}, ожидаемая=${expectedCost}`
        );

        const priceCheck = new PriceCheck(coreRepo, apiOrder);
        priceCheck.checkOrderCost({ expectedCost });

        const dbFinalOrder = await walletActivationHelper.waitForOrderCompleted({
          orderId: apiOrder.id,
        });
        const getOrderResponse = await orderApi.getOrderById({ orderId: apiOrder.id });
        statusCheck.checkResponseStatus(getOrderResponse);
        const apiFinalOrder = (await getOrderResponse.json()) as Order;
        log.info(
          `Получен финальный заказ от API (ENERGY, by id): ${JSON.stringify(apiFinalOrder, null, 2)}`
        );

        orderFieldCheck.checkAllFields(apiFinalOrder);
        orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);

        const priceCheckFinal = new PriceCheck(coreRepo, apiFinalOrder);
        await priceCheckFinal.checkEnergyOrderPriceByFormula({
          period,
          energyAmount: combo.energy,
          sunRate: combo.sunRate,
        });

        try {
          await coreRepo.coreConstantsKeyPut({
            key: "PRICE_ENERGY",
            coreUsersUserIdSettingsKeyPutRequest: { value: initialPriceEnergy },
          });
          log.info(
            `PRICE_ENERGY восстановлено в начальное состояние: ${JSON.stringify({ value: initialPriceEnergy })}`
          );
        } catch (error) {
          log.error(`Ошибка при восстановлении начального значения PRICE_ENERGY: ${error}`);
        }

        log.info(
          `✓ Комбинация успешно проверена: период=${combo.duration}, энергия=${combo.energy}, курс=${combo.sunRate}`
        );
      });
    }
  });

  test.describe("Тест-кейс № 8: Создание заказов с различными комбинациями полосы пропускания, периодов и цен для PRICE_BANDWIDTH", () => {
    const combinations = BANDWIDTH_PURCHASE_COMBINATIONS;
    log.info(`Найдено ${combinations.length} комбинаций для тестирования`);

    for (const combo of combinations) {
      test(`should create order with bandwidth=${combo.bandwidth}, period=${combo.duration}, sunRate=${combo.sunRate}`, async ({
        request,
      }) => {
        test.setTimeout(300000);
        const period = parseBandwidthDuration(combo.duration);
        const { hour, day } = getFormulaParams(period);
        const expectedCost = BANDWIDTH_PRICE_FORMULA(combo.sunRate, hour, day, combo.bandwidth);
        log.info(
          `=== Тест: Создание заказа BANDWIDTH (период=${combo.duration}, bandwidth=${combo.bandwidth}, курс SUN=${combo.sunRate}, ожидаемая стоимость=${expectedCost} TRX) ===`
        );

        const orderApi = new OrderApi(request);
        const coreRepo = new CoreRepository();

        const { wallet, activationOrder } = await walletActivationHelper.createActivatedWallet(
          request,
          statusCheck
        );
        const targetAddress = wallet.address?.base58 || "";
        await walletActivationHelper.waitForActivationCompleted({
          orderId: activationOrder.id,
          targetAddress,
          timeoutMs: 30000,
          stepMs: 1000,
        });

        const initialPriceResponse = await coreRepo.coreConstantsKeyGet({ key: "PRICE_BANDWIDTH" });
        const initialPriceBandwidth: BandwidthPriceValues = { ...initialPriceResponse.data };
        log.info(
          `Начальное значение PRICE_BANDWIDTH сохранено: ${JSON.stringify(initialPriceBandwidth)}`
        );

        try {
          const currentPriceResponse = await coreRepo.coreConstantsKeyGet({
            key: "PRICE_BANDWIDTH",
          });

          const priceValues: BandwidthPriceValues = {
            "1h": currentPriceResponse.data["1h"],
            "1d": currentPriceResponse.data["1d"],
          };

          priceValues[combo.duration as keyof BandwidthPriceValues] = combo.sunRate;

          await coreRepo.coreConstantsKeyPut({
            key: "PRICE_BANDWIDTH",
            coreUsersUserIdSettingsKeyPutRequest: { value: priceValues },
          });
          log.info(`PRICE_BANDWIDTH установлен: ${JSON.stringify({ value: priceValues })}`);

          const verifyResponse = await coreRepo.coreConstantsKeyGet({ key: "PRICE_BANDWIDTH" });
          const actualValue = verifyResponse.data[combo.duration];

          if (actualValue !== combo.sunRate) {
            throw new Error(
              `PRICE_BANDWIDTH не установлен корректно. Ожидалось: ${combo.sunRate}, получено: ${actualValue}`
            );
          }
          log.info(`PRICE_BANDWIDTH проверен: ${combo.duration} = ${actualValue}`);
        } catch (error) {
          log.error(`Ошибка при установке PRICE_BANDWIDTH: ${error}`);
          throw error;
        }

        const bandwidthRequest: CreateOrderRequest = {
          type: OrderType.BANDWIDTH,
          targetAddress,
          amount: combo.bandwidth,
          period: period,
        };

        log.info(
          `Отправка запроса на создание заказа BANDWIDTH: ${JSON.stringify(bandwidthRequest, null, 2)}`
        );
        const response = await orderApi.createNewOrder({ data: bandwidthRequest });
        statusCheck.checkResponseStatus(response);

        const apiOrder = (await response.json()) as Order;
        log.info(`Получен ответ от API (BANDWIDTH): ${JSON.stringify(apiOrder, null, 2)}`);
        log.info(
          `Заказ создан: id=${apiOrder.id}, стоимость=${apiOrder.sellPrice}, ожидаемая=${expectedCost}`
        );

        const priceCheck = new PriceCheck(coreRepo, apiOrder);
        priceCheck.checkOrderCost({ expectedCost });

        const dbFinalOrder = await walletActivationHelper.waitForOrderCompleted({
          orderId: apiOrder.id,
        });
        const getOrderResponse = await orderApi.getOrderById({ orderId: apiOrder.id });
        statusCheck.checkResponseStatus(getOrderResponse);
        const apiFinalOrder = (await getOrderResponse.json()) as Order;
        log.info(
          `Получен финальный заказ от API (BANDWIDTH, by id): ${JSON.stringify(apiFinalOrder, null, 2)}`
        );

        orderFieldCheck.checkAllFields(apiFinalOrder);
        orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);

        const priceCheckFinal = new PriceCheck(coreRepo, apiFinalOrder);
        await priceCheckFinal.checkBandwidthOrderPriceByFormula({
          period,
          bandwidthAmount: combo.bandwidth,
        });

        try {
          await coreRepo.coreConstantsKeyPut({
            key: "PRICE_BANDWIDTH",
            coreUsersUserIdSettingsKeyPutRequest: { value: initialPriceBandwidth },
          });
          log.info(
            `PRICE_BANDWIDTH восстановлено в начальное состояние: ${JSON.stringify({ value: initialPriceBandwidth })}`
          );
        } catch (error) {
          log.error(`Ошибка при восстановлении начального значения PRICE_BANDWIDTH: ${error}`);
        }

        log.info(
          `✓ Комбинация успешно проверена: период=${combo.duration}, bandwidth=${combo.bandwidth}, курс=${combo.sunRate}`
        );
      });
    }
  });

  test("Тест-кейс № 9: Создание заказа для пользователя без заказов с 0 балансом", async ({
    request,
  }) => {
    log.info("=== Тест: Создание заказа для пользователя без заказов с 0 балансом ===");

    const { wallet, activationOrder } = await walletActivationHelper.createActivatedWallet(
      request,
      statusCheck
    );
    const targetAddress = wallet.address?.base58 || "";
    await walletActivationHelper.waitForActivationCompleted({
      orderId: activationOrder.id,
      targetAddress,
      timeoutMs: 30000,
      stepMs: 1000,
    });

    const energyRequest: CreateOrderRequest = {
      type: OrderType.ENERGY,
      targetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    };

    const response = await request.post(`${apiUrl}/api/v2/orders/`, {
      headers: getPostHeaders(apiKeyZero),
      data: energyRequest,
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    const status = response.status();
    log.info(`Статус ответа: ${status}`);

    const headers = response.headers();
    const contentType = headers["content-type"] ?? headers["Content-Type"] ?? "";

    if (contentType.includes("application/json")) {
      const responseBody = await response.json().catch(() => undefined);
      log.info(`Response body: ${JSON.stringify(responseBody, null, 2)}`);
    } else {
      const responseText = await response.text().catch(() => "");
      log.info(`Response text: ${responseText}`);
    }

    log.info("✓ Тест завершен: проверка создания заказа для пользователя с нулевым балансом");
  });

  test.describe("Тест-кейс № 10: Создание заказов с различными комбинациями энергии, периодов и цен для PRICE_ENERGY для пользователя со скидкой", () => {
    const combinations = ENERGY_PURCHASE_COMBINATIONS_FOR_USER;
    log.info(`Найдено ${combinations.length} комбинаций для тестирования`);

    for (const combo of combinations) {
      test(`should create order with energy=${combo.energy}, period=${combo.duration}, sunRate=${combo.sunRate}`, async ({
        request,
      }) => {
        test.setTimeout(300000);
        const period = parseEnergyDuration(combo.duration);
        const { hour, day } = getFormulaParams(period);
        const expectedCost = ENERGY_PRICE_FORMULA(combo.sunRate, hour, day, combo.energy);
        log.info(
          `=== Тест: Создание заказа ENERGY для пользователя со скидкой (период=${combo.duration}, энергия=${combo.energy}, курс SUN=${combo.sunRate}, ожидаемая стоимость=${expectedCost} TRX) ===`
        );

        const orderApi = new OrderApi(request);
        const coreRepo = new CoreRepository();

        const { wallet, activationOrder } = await walletActivationHelper.createActivatedWallet(
          request,
          statusCheck
        );
        const targetAddress = wallet.address?.base58 || "";
        await walletActivationHelper.waitForActivationCompleted({
          orderId: activationOrder.id,
          targetAddress,
          timeoutMs: 30000,
          stepMs: 1000,
        });

        try {
          const priceValues: Partial<EnergyPriceValues> = {
            [combo.duration]: combo.sunRate,
          };

          await coreRepo.coreUsersUserIdSettingsKeyPut({
            userId: userIdPrimary,
            key: "PRICE_ENERGY",
            coreUsersUserIdSettingsKeyPutRequest: {
              value: priceValues,
            },
          });
          log.info(
            `PRICE_ENERGY для пользователя установлен: ${JSON.stringify({ value: priceValues })}`
          );

          const verifyResponse = await coreRepo.coreUsersUserIdSettingsKeyGet({
            userId: userIdPrimary,
            key: "PRICE_ENERGY",
          });
          const actualValue = verifyResponse.data[combo.duration];

          if (actualValue !== combo.sunRate) {
            throw new Error(
              `PRICE_ENERGY не установлен корректно. Ожидалось: ${combo.sunRate}, получено: ${actualValue}`
            );
          }
          log.info(`PRICE_ENERGY проверен: ${combo.duration} = ${actualValue}`);
        } catch (error) {
          log.error(`Ошибка при установке PRICE_ENERGY: ${error}`);
          throw error;
        }

        const energyRequest: CreateOrderRequest = {
          type: OrderType.ENERGY,
          targetAddress,
          amount: combo.energy,
          period: period,
        };

        log.info(
          `Отправка запроса на создание заказа ENERGY: ${JSON.stringify(energyRequest, null, 2)}`
        );
        const response = await request.post(`${apiUrl}/api/v2/orders/`, {
          headers: getPostHeaders(apiKeyPrimary),
          data: energyRequest,
        });
        statusCheck.checkResponseStatus(response);

        const apiOrder = (await response.json()) as Order;
        log.info(
          `Заказ создан: id=${apiOrder.id}, стоимость=${apiOrder.sellPrice}, ожидаемая=${expectedCost}`
        );

        const priceCheck = new PriceCheck(coreRepo, apiOrder);
        priceCheck.checkOrderCost({ expectedCost });

        const dbFinalOrder = await walletActivationHelper.waitForOrderCompleted({
          orderId: apiOrder.id,
        });
        const getOrderResponse = await orderApi.getOrderById({ orderId: apiOrder.id });
        statusCheck.checkResponseStatus(getOrderResponse);
        const apiFinalOrder = (await getOrderResponse.json()) as Order;

        orderFieldCheck.checkAllFields(apiFinalOrder);
        orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);

        const priceCheckFinal = new PriceCheck(coreRepo, apiFinalOrder);
        await priceCheckFinal.checkEnergyOrderPriceByFormula({
          period,
          energyAmount: combo.energy,
          sunRate: combo.sunRate,
        });

        log.info(
          `✓ Комбинация успешно проверена: период=${combo.duration}, энергия=${combo.energy}, курс=${combo.sunRate}`
        );
      });
    }
  });
});
