import { test, expect, APIRequestContext } from "@playwright/test";
import { createWallet } from "../repositories/tronweb";
import { log } from "../../../shared/utils/logger";
import { OrderFieldCheck } from "../test-objects/order-field-check";
import { ResponseStatusCheck } from "../test-objects/response-status-check";
import { OrderResponseCheck } from "../test-objects/order-response-check";
import {
  CreateActivationOrderRequest,
  CreateOrderRequest,
  EnergyOrderPeriodMs,
  Order,
} from "../../../shared/utils/types";
import { OrderApi } from "../api/order.api";
import { OrderRepository } from "../repositories/order.repository";
import {
  BANDWIDTH_AMOUNT_DEFAULT,
  ENERGY_AMOUNT_DEFAULT,
  OrderPeriod,
} from "../../../shared/utils/constants";
import { invalidCreateOrderRequestVariations } from "../test-objects/invalid-create-order-request-variations";
import {
  ENERGY_PURCHASE_COMBINATIONS,
  EnergyPurchaseCombination,
} from "../test-objects/energy-purchase-combinations";
import { CoreRepository } from "../repositories/core.repository";
import { apiUrl } from "../api/constants";

test.describe("Create new order", () => {
  const orderFieldCheck = new OrderFieldCheck();
  const orderResponseCheck = new OrderResponseCheck();
  const statusCheck = new ResponseStatusCheck();
  const orderRepo = new OrderRepository();

  async function createActivatedWallet(request: APIRequestContext) {
    const wallet = await createWallet();
    log.info(`Создан кошелек для активации: ${wallet.address?.base58}`);

    const orderApi = new OrderApi(request);
    const activationRequest: CreateActivationOrderRequest = {
      type: "ACTIVATION",
      targetAddress: wallet.address?.base58 || "",
    };

    const activationResponse = await orderApi.createNewOrder(activationRequest);
    const activationStatus = activationResponse.status();
    log.info(`API запрос (ACTIVATION) выполнен. Статус: ${activationStatus}`);
    statusCheck.checkResponseStatus(activationResponse);

    const activationOrder = (await activationResponse.json()) as Order;
    log.info(`API Response (ACTIVATION): ${JSON.stringify(activationOrder, null, 2)}`);

    return { wallet, activationOrder };
  }

  async function waitForActivationCompleted(
    orderId: number,
    targetAddress: string,
    timeoutMs = 30000,
    stepMs = 1000
  ) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const dbRows = await orderRepo.getOrderById(orderId);
      const dbOrder = dbRows[0] as any;
      if (dbOrder?.status === "COMPLETED") {
        log.info(`Активация в БД завершена (orderId=${orderId})`);
        expect(dbOrder.type).toBe("ACTIVATION");
        expect(dbOrder.targetAddress).toBe(targetAddress);
        return dbOrder;
      }

      log.info(
        `Активация orderId=${orderId} ещё не завершена, статус=${dbOrder?.status ?? "none"}`
      );
      await new Promise((r) => setTimeout(r, stepMs));
    }

    throw new Error(
      `Активация orderId=${orderId} для адреса ${targetAddress} не перешла в COMPLETED за ${timeoutMs} мс`
    );
  }

  async function waitForOrderCompleted(orderId: number, timeoutMs = 90000, stepMs = 1000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const dbRows = await orderRepo.getOrderById(orderId);
      const dbOrder = dbRows[0] as any;

      const status = dbOrder?.status;
      if (status === "FAILED") {
        log.info(`Заказ в БД завершился FAILED (orderId=${orderId})`);
        throw new Error(
          `Заказ orderId=${orderId} завершился FAILED. DB: ${JSON.stringify(dbOrder, null, 2)}`
        );
      }

      if (status === "COMPLETED") {
        log.info(`Заказ в БД завершился COMPLETED (orderId=${orderId})`);
        return dbOrder;
      }

      log.info(`Заказ orderId=${orderId} ещё не в финальном статусе, статус=${status ?? "none"}`);
      await new Promise((r) => setTimeout(r, stepMs));
    }

    throw new Error(`Заказ orderId=${orderId} не перешёл в COMPLETED за ${timeoutMs} мс`);
  }

  // Тест-кейс № 1: Проверка создания нового заказа и валидации полей ответа
  test("POST /api/v2/orders/ should return valid order fields", async ({ request }) => {
    log.info("=== Тест: Создание нового заказа ===");
    const orderApi = new OrderApi(request);
    const { wallet, activationOrder } = await createActivatedWallet(request);
    await waitForActivationCompleted(activationOrder.id, wallet.address?.base58 || "", 30000, 1000);

    const energyRequest: CreateOrderRequest = {
      type: "ENERGY",
      targetAddress: wallet.address?.base58 || "",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    };

    const response = await orderApi.createNewOrder(energyRequest);

    statusCheck.checkResponseStatus(response);

    const apiOrder = (await response.json()) as Order;
    log.info(`API Response (ENERGY): ${JSON.stringify(apiOrder, null, 2)}`);

    orderFieldCheck.checkAllFields(apiOrder);

    const dbFinalOrder = await waitForOrderCompleted(apiOrder.id);
    const getOrderResponse = await orderApi.getOrderById(apiOrder.id);
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

  // Тест-кейс № 2: Проверка невалидных значений в запросе
  for (const variation of invalidCreateOrderRequestVariations) {
    test(`POST /api/v2/orders/ should reject invalid request: ${variation.description}`, async ({
      request,
    }) => {
      const orderApi = new OrderApi(request);

      const response = await orderApi.createNewOrder(variation.data);
      statusCheck.checkResponseStatus(response, variation.expectedStatus ?? 400);

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
  // Тест-кейс № 3: Создание одного заказа с type = ENERGY
  test("POST /api/v2/orders/ should create single ENERGY order", async ({ request }) => {
    const orderApi = new OrderApi(request);

    const { wallet, activationOrder } = await createActivatedWallet(request);
    const targetAddress = wallet.address?.base58 || "";
    await waitForActivationCompleted(activationOrder.id, targetAddress, 30000, 1000);

    const energyRequest: CreateOrderRequest = {
      type: "ENERGY",
      targetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    };

    const response = await orderApi.createNewOrder(energyRequest);
    statusCheck.checkResponseStatus(response);

    const apiOrder = (await response.json()) as Order;
    log.info(`API Response (ENERGY): ${JSON.stringify(apiOrder, null, 2)}`);

    orderFieldCheck.checkAllFields(apiOrder);

    const dbFinalOrder = await waitForOrderCompleted(apiOrder.id);
    const getOrderResponse = await orderApi.getOrderById(apiOrder.id);
    statusCheck.checkResponseStatus(getOrderResponse);
    const apiFinalOrder = (await getOrderResponse.json()) as Order;

    orderFieldCheck.checkAllFields(apiFinalOrder);
    orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);
  });

  // Тест-кейс № 4: Создание заказа с type = BANDWIDTH
  test("POST /api/v2/orders/ should create single BANDWIDTH order", async ({ request }) => {
    const orderApi = new OrderApi(request);

    const { wallet, activationOrder } = await createActivatedWallet(request);
    const targetAddress = wallet.address?.base58 || "";
    await waitForActivationCompleted(activationOrder.id, targetAddress, 30000, 1000);

    const bandwidthRequest: CreateOrderRequest = {
      type: "BANDWIDTH",
      targetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    };

    const response = await orderApi.createNewOrder(bandwidthRequest);
    statusCheck.checkResponseStatus(response);

    const apiOrder = (await response.json()) as Order;
    log.info(`API Response (BANDWIDTH): ${JSON.stringify(apiOrder, null, 2)}`);

    orderFieldCheck.checkAllFields(apiOrder);

    const dbFinalOrder = await waitForOrderCompleted(apiOrder.id);
    const getOrderResponse = await orderApi.getOrderById(apiOrder.id);
    statusCheck.checkResponseStatus(getOrderResponse);
    const apiFinalOrder = (await getOrderResponse.json()) as Order;

    orderFieldCheck.checkAllFields(apiFinalOrder);
    orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);
  });

  // Тест-кейс № 5: Создание заказа с type = ACTIVATION, активированный кошелек
  test("POST /api/v2/orders/ should reject ACTIVATION for already activated wallet", async ({
    request,
  }) => {
    const orderApi = new OrderApi(request);

    const { wallet, activationOrder } = await createActivatedWallet(request);
    const targetAddress = wallet.address?.base58 || "";
    await waitForActivationCompleted(activationOrder.id, targetAddress, 30000, 1000);

    const secondActivationRequest: CreateActivationOrderRequest = {
      type: "ACTIVATION",
      targetAddress,
    };

    const response = await orderApi.createNewOrder(secondActivationRequest);
    statusCheck.checkResponseStatus(response, 400);

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

  // Тест-кейс № 6: Создание заказа с type = ACTIVATION, неактивированный кошелек
  test("POST /api/v2/orders/ should create ACTIVATION order for not activated wallet", async ({
    request,
  }) => {
    const orderApi = new OrderApi(request);

    const wallet = await createWallet();
    const targetAddress = wallet.address?.base58 || "";
    expect(targetAddress).not.toBe("");

    const activationRequest: CreateActivationOrderRequest = {
      type: "ACTIVATION",
      targetAddress,
    };

    const response = await orderApi.createNewOrder(activationRequest);
    statusCheck.checkResponseStatus(response);

    const apiOrder = (await response.json()) as Order;
    log.info(`API Response (ACTIVATION): ${JSON.stringify(apiOrder, null, 2)}`);

    orderFieldCheck.checkAllFields(apiOrder);

    const dbFinalOrder = await waitForActivationCompleted(apiOrder.id, targetAddress, 30000, 1000);
    const getOrderResponse = await orderApi.getOrderById(apiOrder.id);
    statusCheck.checkResponseStatus(getOrderResponse);
    const apiFinalOrder = (await getOrderResponse.json()) as Order;

    orderFieldCheck.checkAllFields(apiFinalOrder);
    orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);
  });

    // Тест-кейс № 7: Создание заказов с различными комбинациями энергии, периодов и цен
  test("POST /api/v2/orders/ should create orders with different energy purchase combinations", async ({
    request,
  }) => {
    log.info("=== Тест: Создание заказов с различными комбинациями ===");

    const combinations = ENERGY_PURCHASE_COMBINATIONS;
    log.info(`Найдено ${combinations.length} комбинаций для тестирования`);

    const orderApi = new OrderApi(request);
    const coreRepo = new CoreRepository(apiUrl);

    // Создаём активированный кошелёк один раз для всех тестов
    const { wallet, activationOrder } = await createActivatedWallet(request);
    const targetAddress = wallet.address?.base58 || "";
    await waitForActivationCompleted(activationOrder.id, targetAddress, 30000, 1000);

    // Функция для конвертации строки периода в EnergyOrderPeriodMs
    function parsePeriod(duration: EnergyPurchaseCombination["duration"]): EnergyOrderPeriodMs {
      if (duration === "1h") return OrderPeriod.ONE_HOUR as EnergyOrderPeriodMs;
      if (duration === "1d") return OrderPeriod.ONE_DAY as EnergyOrderPeriodMs;
      if (duration === "3d") return OrderPeriod.THREE_DAYS as EnergyOrderPeriodMs;
      throw new Error(`Неизвестный период: ${duration}`);
    }

    // Тестируем каждую комбинацию
    for (const combo of combinations) {
      log.info(
        `Тестируем комбинацию: период=${combo.duration}, энергия=${combo.energy}, курс SUN=${combo.sunRate}, ожидаемая стоимость=${combo.expectedCost} TRX`
      );

      // Устанавливаем PRICE_ENERGY через API
      try {
        await coreRepo.coreConstantsKeyPut("PRICE_ENERGY", { value: combo.sunRate });
        log.info(`PRICE_ENERGY установлен в ${combo.sunRate}`);
      } catch (error) {
        log.error(`Ошибка при установке PRICE_ENERGY: ${error}`);
        throw error;
      }

      // Создаём заказ с указанными параметрами
      const period = parsePeriod(combo.duration);
      const energyRequest: CreateOrderRequest = {
        type: "ENERGY",
        targetAddress,
        amount: combo.energy,
        period: period,
      };

      const response = await orderApi.createNewOrder(energyRequest);
      statusCheck.checkResponseStatus(response);

      const apiOrder = (await response.json()) as Order;
      log.info(
        `Заказ создан: id=${apiOrder.id}, стоимость=${apiOrder.sellPrice}, ожидаемая=${combo.expectedCost}`
      );

      // Проверяем, что стоимость заказа соответствует ожидаемой (с небольшой погрешностью)
      const actualCost = typeof apiOrder.sellPrice === "string" ? parseFloat(apiOrder.sellPrice) : apiOrder.sellPrice;
      const costDifference = Math.abs(actualCost - combo.expectedCost);
      const tolerance = 0.01; // Допустимая погрешность в 0.01 TRX

      expect(
        costDifference,
        `Стоимость заказа ${actualCost} не совпадает с ожидаемой ${combo.expectedCost} (разница: ${costDifference})`
      ).toBeLessThanOrEqual(tolerance);

      // Проверяем поля заказа
      orderFieldCheck.checkAllFields(apiOrder);

      // Дожидаемся завершения заказа и проверяем финальное состояние
      const dbFinalOrder = await waitForOrderCompleted(apiOrder.id);
      const getOrderResponse = await orderApi.getOrderById(apiOrder.id);
      statusCheck.checkResponseStatus(getOrderResponse);
      const apiFinalOrder = (await getOrderResponse.json()) as Order;

      orderFieldCheck.checkAllFields(apiFinalOrder);
      orderResponseCheck.checkOrderFieldEquality(apiFinalOrder, dbFinalOrder);

      // Проверяем финальную стоимость после завершения
      const finalCost = typeof apiFinalOrder.sellPrice === "string" ? parseFloat(apiFinalOrder.sellPrice) : apiFinalOrder.sellPrice;
      const finalCostDifference = Math.abs(finalCost - combo.expectedCost);
      expect(
        finalCostDifference,
        `Финальная стоимость заказа ${finalCost} не совпадает с ожидаемой ${combo.expectedCost}`
      ).toBeLessThanOrEqual(tolerance);

      log.info(`✓ Комбинация успешно проверена: период=${combo.duration}, энергия=${combo.energy}, курс=${combo.sunRate}`);
    }

    log.info(`✓ Все ${combinations.length} комбинаций успешно проверены`);
  });

});
