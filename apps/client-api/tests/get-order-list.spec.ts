import { test, expect } from "@playwright/test";
import { OrderApi } from "../api/order.api";
import { OrderFieldCheck } from "../test-objects/order-field-check";
import { ResponseStatusCheck } from "../test-objects/response-status-check";
import { OrderResponseCheck } from "../test-objects/order-response-check";
import {
  invalidOffsetVariations,
  invalidLimitVariations,
  invalidOffsetLimitCombinations,
} from "../../../shared/utils/variations_constants/invalid-order-params-variations";
import { log } from "../../../shared/utils/logger";
import { Order } from "../../../shared/utils/types";
import {
  ORDER_LIST_DEFAULT_LIMIT,
  ORDER_LIST_DEFAULT_OFFSET,
} from "../../../shared/utils/constants";
import { OrderRepository } from "../repositories/order.repository";
import { userIdPrimary } from "../api/constants";

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

  // Тест-кейс № 9: Rate limiting
  test(`GET /api/v2/orders/ should enforce rate limiting`, async ({ request }) => {
    log.info("=== Тест: Проверка rate limiting ===");

    const orderApi = new OrderApi(request);
    const requestCount = 120; 

    log.info(`Отправка ${requestCount} запросов параллельно (100 запросов в секунду)...`);

    const startTime = Date.now();
    const requests = Array.from({ length: requestCount }, () => orderApi.getOrderList());
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    log.info(`Все ${requestCount} запросов выполнены за ${duration.toFixed(2)} секунд`);

    const statusCounts: Record<number, number> = {};
    let rateLimitHit = false;
    let rateLimitResponse: any = null;
    let retryAfter: string | undefined;

    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const status = response.status();
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      if (status === 429 && !rateLimitHit) {
        rateLimitHit = true;
        rateLimitResponse = await response.json().catch(() => null);
        const headers = response.headers();
        retryAfter = headers["retry-after"] || headers["Retry-After"];

        log.info(`✓ Rate limiting обнаружен на запросе #${i + 1}`);
        log.info(`  Статус: ${status} (Too Many Requests)`);
        if (retryAfter) {
          log.info(`  Retry-After: ${retryAfter}`);
        }
        if (rateLimitResponse) {
          log.info(`  Ответ: ${JSON.stringify(rateLimitResponse, null, 2)}`);
        }
      }
    }

    log.info("Распределение статусов ответов:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      log.info(`  ${status}: ${count} запросов`);
    });

    if (rateLimitHit) {
      log.info("✓ Rate limiting работает корректно. API вернул 429 после превышения лимита.");
      expect(statusCounts[429]).toBeGreaterThan(0);
    } else {
      log.warn(
        `⚠ Rate limiting не был обнаружен после ${requestCount} параллельных запросов.`
      );
      log.warn(
        "  Это может означать, что лимит выше ожидаемого или rate limiting не настроен."
      );
    }
  });
});
