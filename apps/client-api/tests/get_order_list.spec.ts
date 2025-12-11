import { test, expect } from "@playwright/test";
import { OrderApi } from "../api/order.api";
import { OrderFieldTest } from "../TestObjects/OrderFieldTest";
import { ResponseStatusTest } from "../TestObjects/ResponseStatusTest";
import { OrderResponseTest } from "../TestObjects/OrderResponseTest";
import {
  invalidOffsetVariations,
  invalidLimitVariations,
  invalidOffsetLimitCombinations,
} from "../TestObjects/InvalidOrderParamsVariations";
import { checkOrdersBelongToPrimaryUser } from "../TestObjects/OrderOwnershipTest";
import { log } from "../../../shared/utils/logger";
import { Order } from "../../../shared/utils/types";
import { ORDER_LIST_DEFAULT_LIMIT, ORDER_LIST_DEFAULT_OFFSET } from "../../../shared/utils/constants";

// Тестирует корректность работы эндпоинта GET /api/v2/orders/
test.describe("Get order list", () => {
  const responseStatusTest = new ResponseStatusTest();
  const orderFieldTest = new OrderFieldTest();
  const orderResponseTest = new OrderResponseTest();

  const assertSortedByCreatedAtDesc = (orders: Order[]) => {
    for (let i = 1; i < orders.length; i++) {
      const prev = new Date(orders[i - 1].createdAt).getTime();
      const curr = new Date(orders[i].createdAt).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  };

// Тест-кейс № 1: Проверка валидности полей ответа API для пользователя с заказами с дефолтными параметрами
  test(`GET /api/v2/orders/ should return default paginated list`, async ({
    request,
  }) => {
    log.info("=== Тест: Получение списка заказов с параметрами по умолчанию ===");

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderList();
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusTest.checkResponseStatus(response);
    const orders = (await response.json()) as Order[];

    orderResponseTest.checkOrderListBasics(orders, ORDER_LIST_DEFAULT_LIMIT);

    orders.forEach((order: Order) => orderFieldTest.checkAllFields(order));

    assertSortedByCreatedAtDesc(orders);

    log.info("✓ Проверки списка заказов по умолчанию пройдены");
  });

  // Тест-кейс № 2: Проверка невалидных значений offset
  test(`GET /api/v2/orders/ should return 400 for invalid offset values`, async ({ request }) => {
    log.info("=== Тест: Проверка невалидных значений offset ===");

    const orderApi = new OrderApi(request);
    for (const variation of invalidOffsetVariations) {
      log.info(`Проверка: ${variation.description} (offset: ${JSON.stringify(variation.params.offset)})`);

      const response = await orderApi.getOrderList(variation.params as any);
      log.info(`API запрос выполнен. Статус: ${response.status()}`);

      responseStatusTest.checkResponseStatus(response, 400);

      const errorResponse = await response.json();
      log.info(`Ответ ошибки: ${JSON.stringify(errorResponse, null, 2)}`);
      log.info("");
    }

    log.info("✓ Все невалидные значения offset корректно отклонены (400)");
  });

  // Тест-кейс № 3: Проверка невалидных значений limit
  test(`GET /api/v2/orders/ should return 400 for invalid limit values`, async ({ request }) => {
    log.info("=== Тест: Проверка невалидных значений limit ===");

    const orderApi = new OrderApi(request);
    for (const variation of invalidLimitVariations) {
      log.info(`Проверка: ${variation.description} (limit: ${JSON.stringify(variation.params.limit)})`);

      const response = await orderApi.getOrderList(variation.params as any);
      log.info(`API запрос выполнен. Статус: ${response.status()}`);

      responseStatusTest.checkResponseStatus(response, 400);

      const errorResponse = await response.json();
      log.info(`Ответ ошибки: ${JSON.stringify(errorResponse, null, 2)}`);
      log.info("");
    }

    log.info("✓ Все невалидные значения limit корректно отклонены (400)");
  });

  // Тест-кейс № 4: Проверка невалидных комбинаций offset и limit
  test(`GET /api/v2/orders/ should return 400 for invalid offset/limit combinations`, async ({
    request,
  }) => {
    log.info("=== Тест: Проверка невалидных комбинаций offset и limit ===");

    const orderApi = new OrderApi(request);
    for (const variation of invalidOffsetLimitCombinations) {
      log.info(
        `Проверка: ${variation.description} (offset: ${JSON.stringify(
          variation.params.offset
        )}, limit: ${JSON.stringify(variation.params.limit)})`
      );

      const response = await orderApi.getOrderList(variation.params as any);
      log.info(`API запрос выполнен. Статус: ${response.status()}`);

      responseStatusTest.checkResponseStatus(response, 400);

      const errorResponse = await response.json();
      log.info(`Ответ ошибки: ${JSON.stringify(errorResponse, null, 2)}`);
      log.info("");
    }

    log.info("✓ Все невалидные комбинации offset/limit корректно отклонены (400)");
  });

  // Тест-кейс № 5: Проверка значения offset = 0
  test(`GET /api/v2/orders/ should work with offset = 0`, async ({ request }) => {
    log.info("=== Тест: Проверка offset = 0 ===");

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderList({ offset: 0 });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusTest.checkResponseStatus(response);
    const orders = (await response.json()) as Order[];

    orderResponseTest.checkOrderListBasics(orders, ORDER_LIST_DEFAULT_LIMIT);
    orders.forEach((order: Order) => orderFieldTest.checkAllFields(order));
    await checkOrdersBelongToPrimaryUser(orders);
    assertSortedByCreatedAtDesc(orders);

    log.info("✓ offset = 0: получены последние 10 заказов пользователя, отсортированы по убыванию");

  });

  // Тест-кейс № 6: Проверка значения offset = 10
  test(`GET /api/v2/orders/ should work with offset = 10`, async ({ request }) => {
    log.info("=== Тест: Проверка offset = 10 ===");

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderList({ offset: 10 });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusTest.checkResponseStatus(response);
    const orders = (await response.json()) as Order[];

    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeLessThanOrEqual(ORDER_LIST_DEFAULT_LIMIT);

    if (orders.length > 0) {
      orders.forEach((order: Order) => orderFieldTest.checkAllFields(order));
      assertSortedByCreatedAtDesc(orders);
    }

    log.info("✓ offset = 10 обрабатывается корректно");
  });

});
