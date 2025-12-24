import { test, expect } from "@playwright/test";
import { OrderApi } from "@apps/client-api/api/order.api";
import { OrderFieldCheck } from "@apps/client-api/test-objects/order-field-check";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { OrderResponseCheck } from "@apps/client-api/test-objects/order-response-check";
import {
  invalidOffsetVariations,
  invalidLimitVariations,
  invalidOffsetLimitCombinations,
} from "@shared/utils/variations_constants/invalid-order-params-variations";
import { log } from "@shared/utils/logger";
import { Order } from "@shared/utils/types";
import {
  HTTP_STATUS_BAD_REQUEST,
  ORDER_LIST_DEFAULT_LIMIT,
  ORDER_LIST_DEFAULT_OFFSET,
  ORDER_LIST_MAX_LIMIT,
} from "@shared/utils/constants";
import { OrderRepository } from "@apps/client-api/repositories/order.repository";
import { userIdPrimary, userIdZero, apiKeyZero, apiUrl } from "@apps/client-api/api/constants";
import { getHeaders } from "@shared/utils/headers";

// Тестирует корректность работы эндпоинта GET /api/v2/orders/
test.describe("Get order list", () => {
  const responseStatusCheck = new ResponseStatusCheck();
  const orderFieldCheck = new OrderFieldCheck();
  const orderResponseCheck = new OrderResponseCheck();

  // Тест-кейс № 1: Проверка валидности полей ответа API для пользователя с заказами с дефолтными параметрами
  test(`GET /api/v2/orders/ should return default paginated list`, async ({ request }) => {
    log.info("=== Тест: Получение списка заказов с параметрами по умолчанию ===");

    const orderApi = new OrderApi(request);
    const orderRepo = new OrderRepository();
    const expectedOrders = await orderRepo.getOrdersByUserIdPaginated(
      userIdPrimary,
      ORDER_LIST_DEFAULT_OFFSET,
      ORDER_LIST_DEFAULT_LIMIT
    );
    const response = await orderApi.getOrderList();
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const orders = (await response.json()) as Order[];

    orderResponseCheck.checkOrderListIsArray(orders);
    orderResponseCheck.checkOrderListExactLength(orders, expectedOrders.length);
    orders.forEach((order: Order, index: number) => {
      orderResponseCheck.checkOrderFieldEquality(order, expectedOrders[index]);
    });
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

      responseStatusCheck.checkResponseStatus(response, HTTP_STATUS_BAD_REQUEST);

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

      responseStatusCheck.checkResponseStatus(response, HTTP_STATUS_BAD_REQUEST);

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

      responseStatusCheck.checkResponseStatus(response, HTTP_STATUS_BAD_REQUEST);

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
      userIdPrimary,
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
    orders.forEach((order: Order, index: number) => {
      orderResponseCheck.checkOrderFieldEquality(order, expectedOrders[index]);
    });

    log.info("✓ offset = 0: получены последние 10 заказов пользователя, отсортированы по убыванию");
  });

  // Тест-кейс № 6: Проверка значения offset = 10
  test(`GET /api/v2/orders/ should work with offset = 10`, async ({ request }) => {
    log.info("=== Тест: Проверка offset = 10 ===");

    const orderApi = new OrderApi(request);
    const orderRepo = new OrderRepository();

    const expectedOrders = await orderRepo.getOrdersByUserIdPaginated(
      userIdPrimary,
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
    orders.forEach((order: Order, index: number) => {
      orderResponseCheck.checkOrderFieldEquality(order, expectedOrders[index]);
    });

    log.info("✓ offset = 10: получены заказы второй страницы, без пересечений с первой");
  });

  // Тест-кейс № 7: Проверка значения limit = 5
  test(`GET /api/v2/orders/ should respect limit = 5`, async ({ request }) => {
    log.info("=== Тест: Проверка limit = 5 ===");

    const orderApi = new OrderApi(request);
    const orderRepo = new OrderRepository();

    const expectedOrders = await orderRepo.getOrdersByUserIdPaginated(
      userIdPrimary,
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
    orders.forEach((order: Order, index: number) => {
      orderResponseCheck.checkOrderFieldEquality(order, expectedOrders[index]);
    });

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
      userIdPrimary,
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
      orders.forEach((order: Order, index: number) => {
        orderResponseCheck.checkOrderFieldEquality(order, expectedOrders[index]);
      });
    } else {
      expect(orders.length).toBe(0);
      log.info("Получен пустой список заказов (offset превышает количество доступных заказов)");
    }

    log.info("✓ offset = 1000: корректно возвращен пустой массив при отсутствии заказов");
  });

  // Тест-кейс № 10: Проверка комбинации offset = 10, limit = 5
  test(`GET /api/v2/orders/ should work with offset = 10 and limit = 5`, async ({ request }) => {
    log.info("=== Тест: Проверка offset = 10, limit = 5 ===");

    const orderApi = new OrderApi(request);
    const orderRepo = new OrderRepository();

    const expectedOrders = await orderRepo.getOrdersByUserIdPaginated(userIdPrimary, 10, 5);

    const response = await orderApi.getOrderList({ offset: 10, limit: 5 });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const orders = (await response.json()) as Order[];

    orderResponseCheck.checkOrderListIsArray(orders);
    orders.forEach((order: Order) => orderFieldCheck.checkAllFields(order));
    orderResponseCheck.checkSortedByCreatedAtDesc(orders);

    orderResponseCheck.checkOrderListExactLength(orders, expectedOrders.length);
    orders.forEach((order: Order, index: number) => {
      orderResponseCheck.checkOrderFieldEquality(order, expectedOrders[index]);
    });

    log.info("✓ offset = 10, limit = 5: получены ожидаемые 5 заказов, начиная с 11-го");
  });

  // Тест-кейс № 11: Проверка возврата пустого массива для пользователя без заказов
  test(`GET /api/v2/orders/ should return empty array for user with zero orders`, async ({
    request,
  }) => {
    log.info("=== Тест: Проверка возврата пустого массива для пользователя без заказов ===");

    const orderRepo = new OrderRepository();

    const expectedOrders = await orderRepo.getOrdersByUserIdPaginated(
      userIdZero,
      ORDER_LIST_DEFAULT_OFFSET,
      ORDER_LIST_DEFAULT_LIMIT
    );

    const response = await request.get(`${apiUrl}/api/v2/orders/`, {
      headers: getHeaders(apiKeyZero),
      params: {
        offset: ORDER_LIST_DEFAULT_OFFSET,
        limit: ORDER_LIST_DEFAULT_LIMIT,
      },
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const orders = (await response.json()) as Order[];

    orderResponseCheck.checkOrderListIsArray(orders);
    orderResponseCheck.checkOrderListExactLength(orders, expectedOrders.length);
    orderResponseCheck.checkOrderListIsEmpty(orders, expectedOrders);

    log.info("✓ API корректно возвращает пустой массив для пользователя без заказов");
  });

  // Тест-кейс № 12: Проверка значения limit = ORDER_LIST_MAX_LIMIT
  test(`GET /api/v2/orders/ should respect limit = ORDER_LIST_MAX_LIMIT`, async ({ request }) => {
    log.info(`=== Тест: Проверка limit = ${ORDER_LIST_MAX_LIMIT} ===`);

    const orderApi = new OrderApi(request);
    const orderRepo = new OrderRepository();

    const expectedOrders = await orderRepo.getOrdersByUserIdPaginated(
      userIdPrimary,
      ORDER_LIST_DEFAULT_OFFSET,
      ORDER_LIST_MAX_LIMIT
    );

    const response = await orderApi.getOrderList({ limit: ORDER_LIST_MAX_LIMIT });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const orders = (await response.json()) as Order[];

    orderResponseCheck.checkOrderListIsArray(orders);
    orders.forEach((order: Order) => orderFieldCheck.checkAllFields(order));
    orderResponseCheck.checkSortedByCreatedAtDesc(orders);

    orderResponseCheck.checkOrderListExactLength(orders, expectedOrders.length);
    orders.forEach((order: Order, index: number) => {
      orderResponseCheck.checkOrderFieldEquality(order, expectedOrders[index]);
    });

    log.info(
      `✓ limit = ${ORDER_LIST_MAX_LIMIT}: получены ожидаемые заказы пользователя, не более ${ORDER_LIST_MAX_LIMIT}`
    );
  });
});
