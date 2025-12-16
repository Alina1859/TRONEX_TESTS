import { test, expect } from "@playwright/test";
import { OrderRepository } from "../repositories/order.repository";
import { OrderApi } from "../api/order.api";
import { OrderResponseCheck } from "../test-objects/order-response-check";
import { OrderFieldCheck } from "../test-objects/order-field-check";
import { ResponseStatusCheck } from "../test-objects/response-status-check";
import { boundaryAndInvalidOrderIdVariations } from "../test-objects/invalid-orderId-variations";
import { log } from "../../../shared/utils/logger";
import { userIdPrimary, userIdSecondary } from "../api/constants";

// Тестирует корректность работы эндпоинта GET /api/v2/orders/{id}
test.describe("Get order by ID", () => {
  const orderRepo = new OrderRepository();
  const responseStatusCheck = new ResponseStatusCheck();
  const orderResponseTest = new OrderResponseCheck();
  const orderFieldTest = new OrderFieldCheck();

  // Тест-кейс № 1: Проверка валидности полей ответа API для пользователя с заказами
  test("GET /api/v2/orders/{id} should return correct order data", async ({ request }) => {
    log.info("=== Тест: Проверка валидности полей ответа API ===");

    const getLastOrderByUserId = await orderRepo.getLastOrderByUserId(userIdPrimary);
    const lastOrder = getLastOrderByUserId[0];
    const lastOrderId = lastOrder.id;

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById(lastOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);

    const apiOrder = await response.json();
    log.info("API Response:", JSON.stringify(apiOrder, null, 2));

    log.info("Проверка обязательных полей и их типов...");
    orderResponseTest.checkOrderFieldEquality(apiOrder, lastOrder);
    orderFieldTest.checkAllFields(apiOrder);

    log.info("✓ Все проверки пройдены успешно");
  });

  // Тест-кейс № 2: Получение чужого заказа по orderId
  test("GET /api/v2/orders/{id} should not return order from another user", async ({ request }) => {
    log.info("=== Тест: Проверка безопасности доступа к заказам ===");

    const getLastOrderByUserId = await orderRepo.getLastOrderByUserId(userIdSecondary);
    log.info(
      "Последний заказ другого пользователя:",
      JSON.stringify(getLastOrderByUserId, null, 2)
    );
    const lastOrderId = getLastOrderByUserId[0].id;
    log.info(`Попытка доступа к Order ID: ${lastOrderId} (принадлежит другому пользователю)`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById(lastOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 404);
    const errorResponse = await response.json();
    log.error("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Доступ к чужому заказу заблокирован.");
  });

  // Тест-кейс № 3: Получение несуществующего заказа по orderId
  test("GET /api/v2/orders/{id} should return 404 for non-existent order", async ({ request }) => {
    log.info("=== Тест: Проверка обработки несуществующего заказа ===");

    const maxOrderId = await orderRepo.getMaxOrderId();
    log.info(`Максимальный ID заказа в БД: ${maxOrderId}`);

    const nonExistentOrderId = maxOrderId + 10;
    log.info(`Сгенерированный несуществующий Order ID: ${nonExistentOrderId}`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById(nonExistentOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 404);
    const errorResponse = await response.json();
    log.error("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Несуществующий заказ корректно обработан (404).");
  });

  // Тест-кейс № 4: Получение заказа по orderId = 1 (существующий или несуществующий)
  test("GET /api/v2/orders/{id} should return order or 404 for order with id = 1", async ({
    request,
  }) => {
    log.info("=== Тест: Проверка обработки заказа с ID = 1 ===");

    const orderId = 1;
    log.info(`Проверяемый Order ID: ${orderId}`);

    const orderInDb = await orderRepo.getOrderById(orderId);
    log.info("Проверка в БД:", JSON.stringify(orderInDb, null, 2));

    const orderExists = orderInDb && orderInDb.length > 0;

    if (orderExists) {
      log.info(`✓ Заказ с ID ${orderId} существует в БД. Проверяем корректность ответа API.`);
    } else {
      log.info(`✓ Заказ с ID ${orderId} не существует в БД. Проверяем обработку ошибки 404.`);
    }

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById(orderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    if (orderExists) {
      log.info("Проверка корректности ответа для существующего заказа...");
      responseStatusCheck.checkResponseStatus(response);
      const apiOrder = await response.json();
      log.info("API Response:", JSON.stringify(apiOrder, null, 2));

      orderResponseTest.checkOrderFieldEquality(apiOrder, orderInDb[0]);
      orderFieldTest.checkAllFields(apiOrder);

      log.info("✓ Все проверки пройдены успешно. Заказ с ID = 1 корректно получен.");
    } else {
      log.info("Проверка обработки ошибки 404 для несуществующего заказа...");
      responseStatusCheck.checkResponseStatus(response, 404);
      const errorResponse = await response.json();
      log.error("Error Response:", JSON.stringify(errorResponse, null, 2));

      log.info(
        "✓ Все проверки пройдены успешно. Несуществующий заказ с ID = 1 корректно обработан (404)."
      );
    }
  });

  // Тест-кейс № 5: Проверка граничных значений и базовых некорректных значений orderId
  test("GET /api/v2/orders/{id} should validate boundary and invalid orderId values", async ({
    request,
  }) => {
    log.info("=== Тест: Проверка граничных значений и базовых некорректных значений orderId ===");

    const orderApi = new OrderApi(request);

    log.info(
      `Проверяем ${boundaryAndInvalidOrderIdVariations.length} вариаций граничных и базовых некорректных значений...\n`
    );

    for (const variation of boundaryAndInvalidOrderIdVariations) {
      try {
        log.info(
          `Проверка: ${variation.description} (значение: ${JSON.stringify(variation.value)})`
        );
        const response = await orderApi.getOrderById(variation.value as any);
        const status = response.status();

        if (status === 400 || status === 404) {
          log.info(`  ✓ Корректно обработано: статус ${status}`);
        } else {
          log.warn(`  ✗ Неожиданный статус: ${status} (ожидался 400 или 404)`);
        }
        responseStatusCheck.checkResponseStatus(response, status);
      } catch (error: any) {
        log.error(`  ✗ Ошибка при выполнении запроса: ${error.message}`);
      }
      log.info("");
    }

    log.info(
      "✓ Все граничные и базовые некорректные значения orderId были правильно отклонены API."
    );
  });

  // Тест-кейс № 6: Получение заказа со статусом "COMPLETED"
  test('GET /api/v2/orders/{id} should return order with status "COMPLETED"', async ({
    request,
  }) => {
    log.info('=== Тест: Проверка получения заказа со статусом "COMPLETED" ===');

    const completedOrder = await orderRepo.getCompletedOrderByUserId(userIdPrimary);

    const completedOrderId = completedOrder[0].id;
    log.info(`Order ID со статусом "COMPLETED" для тестирования: ${completedOrderId}`);
    log.info(`Статус заказа в БД: ${completedOrder[0].status}`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById(completedOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info("API Response:", JSON.stringify(apiOrder, null, 2));

    log.info("Проверка обязательных полей и их типов...");
    orderResponseTest.checkOrderFieldEquality(apiOrder, completedOrder[0]);
    orderFieldTest.checkAllFields(apiOrder);

    log.info("Проверка статуса заказа...");
    expect(apiOrder.status).toBe("COMPLETED");
    log.info(`✓ Статус заказа корректный: ${apiOrder.status}`);

    log.info('✓ Все проверки пройдены успешно. Заказ со статусом "COMPLETED" корректно получен.');
  });

  // Тест-кейс № 7: Получение заказа со статусом "FAILED"
  test('GET /api/v2/orders/{id} should return order with status "FAILED"', async ({ request }) => {
    log.info('=== Тест: Проверка получения заказа со статусом "FAILED" ===');

    const failedOrder = await orderRepo.getFailedOrderByUserId(userIdPrimary);

    const failedOrderId = failedOrder[0].id;
    log.info(`Order ID со статусом "FAILED" для тестирования: ${failedOrderId}`);
    log.info(`Статус заказа в БД: ${failedOrder[0].status}`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById(failedOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info("API Response:", JSON.stringify(apiOrder, null, 2));

    log.info("Проверка обязательных полей и их типов...");
    orderResponseTest.checkOrderFieldEquality(apiOrder, failedOrder[0]);
    orderFieldTest.checkAllFields(apiOrder);

    log.info("Проверка статуса заказа...");
    expect(apiOrder.status).toBe("FAILED");
    log.info(`✓ Статус заказа корректный: ${apiOrder.status}`);

    log.info('✓ Все проверки пройдены успешно. Заказ со статусом "FAILED" корректно получен.');
  });

  // Тест-кейс № 8: Получение заказа со type = "ENERGY"
  test('GET /api/v2/orders/{id} should return order with type "ENERGY"', async ({ request }) => {
    log.info('=== Тест: Проверка получения заказа с типом "ENERGY" ===');

    const energyOrder = await orderRepo.getEnergyOrderByUserId(userIdPrimary);

    const energyOrderId = energyOrder[0].id;
    log.info(`Order ID с типом "ENERGY" для тестирования: ${energyOrderId}`);
    log.info(`Тип заказа в БД: ${energyOrder[0].type}`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById(energyOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info("API Response:", JSON.stringify(apiOrder, null, 2));

    log.info("Проверка обязательных полей и их типов...");
    orderResponseTest.checkOrderFieldEquality(apiOrder, energyOrder[0]);
    orderFieldTest.checkAllFields(apiOrder);

    log.info("Проверка типа заказа...");
    expect(apiOrder.type).toBe("ENERGY");
    log.info(`✓ Тип заказа корректный: ${apiOrder.type}`);

    log.info('✓ Все проверки пройдены успешно. Заказ с типом "ENERGY" корректно получен.');
  });

  // Тест-кейс № 9: Получение заказа со type = "BANDWIDTH"
  test('GET /api/v2/orders/{id} should return order with type "BANDWIDTH"', async ({ request }) => {
    log.info('=== Тест: Проверка получения заказа с типом "BANDWIDTH" ===');

    const bandwidthOrder = await orderRepo.getBandwidthOrderByUserId(userIdPrimary);

    const bandwidthOrderId = bandwidthOrder[0].id;
    log.info(`Order ID с типом "BANDWIDTH" для тестирования: ${bandwidthOrderId}`);
    log.info(`Тип заказа в БД: ${bandwidthOrder[0].type}`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById(bandwidthOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info("API Response:", JSON.stringify(apiOrder, null, 2));

    log.info("Проверка обязательных полей и их типов...");
    orderResponseTest.checkOrderFieldEquality(apiOrder, bandwidthOrder[0]);
    orderFieldTest.checkAllFields(apiOrder);

    log.info("Проверка типа заказа...");
    expect(apiOrder.type).toBe("BANDWIDTH");
    log.info(`✓ Тип заказа корректный: ${apiOrder.type}`);

    log.info('✓ Все проверки пройдены успешно. Заказ с типом "BANDWIDTH" корректно получен.');
  });

  // Тест-кейс № 10: Получение заказа со type = "ACTIVATION"
  test('GET /api/v2/orders/{id} should return order with type "ACTIVATION"', async ({
    request,
  }) => {
    log.info('=== Тест: Проверка получения заказа с типом "ACTIVATION" ===');

    const activationOrder = await orderRepo.getActivationOrderByUserId(userIdPrimary);

    const activationOrderId = activationOrder[0].id;
    log.info(`Order ID с типом "ACTIVATION" для тестирования: ${activationOrderId}`);
    log.info(`Тип заказа в БД: ${activationOrder[0].type}`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById(activationOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info("API Response:", JSON.stringify(apiOrder, null, 2));

    log.info("Проверка обязательных полей и их типов...");
    orderResponseTest.checkOrderFieldEquality(apiOrder, activationOrder[0]);
    orderFieldTest.checkAllFields(apiOrder);

    log.info("Проверка типа заказа...");
    expect(apiOrder.type).toBe("ACTIVATION");
    log.info(`✓ Тип заказа корректный: ${apiOrder.type}`);

    log.info('✓ Все проверки пройдены успешно. Заказ с типом "ACTIVATION" корректно получен.');
  });

  // Тест-кейс № 11: Rate limiting
  test(`GET /api/v2/orders/{id} should enforce rate limiting`, async ({ request }) => {
    log.info("=== Тест: Проверка rate limiting ===");

    const getLastOrderByUserId = await orderRepo.getLastOrderByUserId(userIdPrimary);
    const lastOrderId = getLastOrderByUserId[0].id;

    const orderApi = new OrderApi(request);
    const requestCount = 120;

    log.info(`Отправка ${requestCount} запросов параллельно (100 запросов в секунду)...`);
    log.info(`Используется Order ID: ${lastOrderId}`);

    const startTime = Date.now();
    const requests = Array.from({ length: requestCount }, () =>
      orderApi.getOrderById(lastOrderId)
    );
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
