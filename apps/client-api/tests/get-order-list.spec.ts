import { test, expect } from "@playwright/test";
import { OrderApi, PRIMARY_USER_ID } from "../api/order.api";
import { OrderFieldCheck } from "../test-objects/order-field-check";
import { ResponseStatusCheck } from "../test-objects/response-status-check";
import { OrderResponseCheck } from "../test-objects/order-response-check";
import {
  invalidOffsetVariations,
  invalidLimitVariations,
  invalidOffsetLimitCombinations,
} from "../test-objects/invalid-order-params-variations";
import { log } from "../../../shared/utils/logger";
import { Order } from "../../../shared/utils/types";
import {
  ORDER_LIST_DEFAULT_LIMIT,
  ORDER_LIST_DEFAULT_OFFSET,
} from "../../../shared/utils/constants";
import { OrderRepository } from "../repositories/order.repository";

// Тестирует корректность работы эндпоинта GET /api/v2/orders/
test.describe("Get order list", () => {
  const responseStatusCheck = new ResponseStatusCheck();
  const orderFieldCheck = new OrderFieldCheck();
  const orderResponseCheck = new OrderResponseCheck();

  // Тест-кейс № 1: Проверка валидности полей ответа API для пользователя с заказами с дефолтными параметрами
  test(`GET /api/v2/orders/ should return default paginated list`, async ({ request }) => {
    log.info("=== Тест: Получение списка заказов с параметрами по умолчанию ===");

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderList();
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const orders = (await response.json()) as Order[];

    orders.forEach((order: Order) => orderFieldCheck.checkAllFields(order));
    orderResponseCheck.checkSortedByCreatedAtDesc(orders);

    log.info("✓ Проверки списка заказов по умолчанию пройдены");
  });

  // Тест-кейс № 2: Проверка невалидных значений offset
  test(`GET /api/v2/orders/ should return 400 for invalid offset values`, async ({ request }) => {
    log.info("=== Тест: Проверка невалидных значений offset ===");

    const orderApi = new OrderApi(request);
    for (const variation of invalidOffsetVariations) {
      log.info(
        `Проверка: ${variation.description} (offset: ${JSON.stringify(variation.params.offset)})`
      );

      const response = await orderApi.getOrderList(variation.params as any);
      log.info(`API запрос выполнен. Статус: ${response.status()}`);

      responseStatusCheck.checkResponseStatus(response, 400);

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
      log.info(
        `Проверка: ${variation.description} (limit: ${JSON.stringify(variation.params.limit)})`
      );

      const response = await orderApi.getOrderList(variation.params as any);
      log.info(`API запрос выполнен. Статус: ${response.status()}`);

      responseStatusCheck.checkResponseStatus(response, 400);

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

      responseStatusCheck.checkResponseStatus(response, 400);

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
    const orderRepo = new OrderRepository();
    const expectedOrders = await orderRepo.getOrdersByUserIdPaginated(
      PRIMARY_USER_ID,
      0,
      ORDER_LIST_DEFAULT_LIMIT
    );

    const response = await orderApi.getOrderList({ offset: 0 });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const orders = (await response.json()) as Order[];

    orderResponseCheck.checkOrderListIsArray(orders);
    orders.forEach((order: Order) => orderFieldCheck.checkAllFields(order));
    orderResponseCheck.checkSortedByCreatedAtDesc(orders);

    orderResponseCheck.checkOrderListExactLength(orders, expectedOrders.length);
    orderResponseCheck.checkOrderIdsMatch(orders, expectedOrders);

    log.info("✓ offset = 0: получены последние 10 заказов пользователя, отсортированы по убыванию");
  });

  // Тест-кейс № 6: Проверка значения offset = 10
  test(`GET /api/v2/orders/ should work with offset = 10`, async ({ request }) => {
    log.info("=== Тест: Проверка offset = 10 ===");

    const orderApi = new OrderApi(request);
    const orderRepo = new OrderRepository();

    const expectedOrders = await orderRepo.getOrdersByUserIdPaginated(
      PRIMARY_USER_ID,
      10,
      ORDER_LIST_DEFAULT_LIMIT
    );

    const response = await orderApi.getOrderList({ offset: 10 });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const orders = (await response.json()) as Order[];

    orderResponseCheck.checkOrderListIsArray(orders);
    orders.forEach((order: Order) => orderFieldCheck.checkAllFields(order));
    orderResponseCheck.checkSortedByCreatedAtDesc(orders);

    orderResponseCheck.checkOrderListExactLength(orders, expectedOrders.length);
    orderResponseCheck.checkOrderIdsMatch(orders, expectedOrders);

    log.info("✓ offset = 10: получены заказы второй страницы, без пересечений с первой");
  });

  // Тест-кейс № 7: Проверка значения limit = 5
  test(`GET /api/v2/orders/ should respect limit = 5`, async ({ request }) => {
    log.info("=== Тест: Проверка limit = 5 ===");

    const orderApi = new OrderApi(request);
    const orderRepo = new OrderRepository();

    const expectedOrders = await orderRepo.getOrdersByUserIdPaginated(
      PRIMARY_USER_ID,
      ORDER_LIST_DEFAULT_OFFSET,
      5
    );

    const response = await orderApi.getOrderList({ limit: 5 });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const orders = (await response.json()) as Order[];

    orderResponseCheck.checkOrderListIsArray(orders);
    orders.forEach((order: Order) => orderFieldCheck.checkAllFields(order));
    orderResponseCheck.checkSortedByCreatedAtDesc(orders);

    orderResponseCheck.checkOrderListExactLength(orders, expectedOrders.length);
    orderResponseCheck.checkOrderIdsMatch(orders, expectedOrders);

    log.info("✓ limit = 5: получены ожидаемые заказы пользователя, не более 5");
  });

  // Тест-кейс № 8: Проверка значения offset = 1000
  test(`GET /api/v2/orders/ should return empty array when offset is too large`, async ({
    request,
  }) => {
    log.info("=== Тест: Проверка offset = 1000 ===");

    const orderApi = new OrderApi(request);
    const orderRepo = new OrderRepository();

    const expectedOrders = await orderRepo.getOrdersByUserIdPaginated(
      PRIMARY_USER_ID,
      1000,
      ORDER_LIST_DEFAULT_LIMIT
    );

    const response = await orderApi.getOrderList({ offset: 1000 });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const orders = (await response.json()) as Order[];

    orderResponseCheck.checkOrderListIsArray(orders);
    orderResponseCheck.checkOrderListExactLength(orders, expectedOrders.length);
    if (expectedOrders.length > 0) {
      orders.forEach((order: Order) => orderFieldCheck.checkAllFields(order));
      orderResponseCheck.checkSortedByCreatedAtDesc(orders);
      orderResponseCheck.checkOrderIdsMatch(orders, expectedOrders);
    } else {
      expect(orders.length).toBe(0);
      log.info("Получен пустой список заказов (offset превышает количество доступных заказов)");
    }

    log.info("✓ offset = 1000: корректно возвращен пустой массив при отсутствии заказов");
  });
});
