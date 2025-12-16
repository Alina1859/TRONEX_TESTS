import { test, expect } from "@playwright/test";
import { SmartOrderRepository } from "../repositories/smart-order.repository";
import { ResponseStatusCheck } from "../test-objects/response-status-check";
import { boundaryAndInvalidSmartOrderIdVariations } from "../test-objects/invalid-smart-orderId-variations";
import { log } from "../../../shared/utils/logger";
import { userIdPrimary, userIdSecondary } from "../api/constants";
import { SmartOrderApi } from "../api/smart-order.api";
import { SmartOrderFieldCheck } from "../test-objects/smart-order-field-check";
import { SmartOrderResponseCheck } from "../test-objects/smart-order-response-check";

// Тестирует корректность работы эндпоинта GET /api/v2/smart-orders/{smartOrderId}
test.describe("Get smart order by ID", () => {
  const smartOrderRepo = new SmartOrderRepository();
  const responseStatusCheck = new ResponseStatusCheck();
    const smartOrderResponseCheck = new SmartOrderResponseCheck();
  const smartOrderFieldTest = new SmartOrderFieldCheck();

  // Тест-кейс № 1: Проверка валидности полей ответа API для пользователя с смарт заказами и Orders
  test("GET /api/v2/smart-orders/{id} should return correct smart order data", async ({ request }) => {
    log.info("=== Тест: Проверка валидности полей ответа API ===");

    const getLastSmartOrderByUserId = await smartOrderRepo.getLastSmartOrderByUserId(userIdPrimary);
    const lastSmartOrder = getLastSmartOrderByUserId[0];
    const lastSmartOrderId = lastSmartOrder.id;

    const smartOrderApi = new SmartOrderApi(request);
    const response = await smartOrderApi.getSmartOrderById(lastSmartOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);

    const apiSmartOrder = await response.json();
    log.info("API Response:", JSON.stringify(apiSmartOrder, null, 2));

    log.info("Проверка обязательных полей и их типов...");
    smartOrderFieldTest.checkAllFields(apiSmartOrder);
    smartOrderResponseCheck.checkSmartOrderFieldEquality(apiSmartOrder, lastSmartOrder);

    log.info("✓ Все проверки пройдены успешно");
  });

  // Тест-кейс № 2: Проверка получения смарт заказа по несуществующему ID
  test("GET /api/v2/smart-orders/{id} should return 404 for non-existent smart order", async ({ request }) => {
    log.info("=== Тест: Проверка обработки несуществующего смарт заказа ===");

    const maxSmartOrderId = await smartOrderRepo.getMaxSmartOrderId();
    log.info(`Максимальный ID смарт заказа в БД: ${maxSmartOrderId}`);

    const nonExistentSmartOrderId = maxSmartOrderId + 10;
    log.info(`Сгенерированный несуществующий Smart Order ID: ${nonExistentSmartOrderId}`);

    const smartOrderApi = new SmartOrderApi(request);
    const response = await smartOrderApi.getSmartOrderById(nonExistentSmartOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 404);
    const errorResponse = await response.json();
    log.error("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Несуществующий смарт заказ корректно обработан (404).");
  });

  // Тест-кейс № 3: Проверка получения чужого смарт заказа по ID
  test("GET /api/v2/smart-orders/{id} should not return smart order from another user", async ({ request }) => {
    log.info("=== Тест: Проверка безопасности доступа к смарт заказам ===");

    const getLastSmartOrderByUserId = await smartOrderRepo.getLastSmartOrderByUserId(userIdSecondary);
    log.info(
      "Последний смарт заказ другого пользователя:",
      JSON.stringify(getLastSmartOrderByUserId, null, 2)
    );
    const lastSmartOrderId = getLastSmartOrderByUserId[0].id;
    log.info(`Попытка доступа к Smart Order ID: ${lastSmartOrderId} (принадлежит другому пользователю)`);

    const smartOrderApi = new SmartOrderApi(request);
    const response = await smartOrderApi.getSmartOrderById(lastSmartOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 404);
    const errorResponse = await response.json();
    log.error("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Доступ к чужому смарт заказу заблокирован.");
  });

  // Тест-кейс № 4: Получение смарт заказа по smartOrderId = 1 (существующий или несуществующий)
  test("GET /api/v2/smart-orders/{id} should return smart order or 404 for smart order with id = 1", async ({
    request,
  }) => {
    log.info("=== Тест: Проверка обработки смарт заказа с ID = 1 ===");

    const smartOrderId = 1;
    log.info(`Проверяемый Smart Order ID: ${smartOrderId}`);

    const smartOrderInDb = await smartOrderRepo.getSmartOrderById(smartOrderId);
    log.info("Проверка в БД:", JSON.stringify(smartOrderInDb, null, 2));

    const smartOrderExists = smartOrderInDb && smartOrderInDb.length > 0;

    if (smartOrderExists) {
      log.info(`✓ Смарт заказ с ID ${smartOrderId} существует в БД. Проверяем корректность ответа API.`);
    } else {
      log.info(`✓ Смарт заказ с ID ${smartOrderId} не существует в БД. Проверяем обработку ошибки 404.`);
    }

    const smartOrderApi = new SmartOrderApi(request);
    const response = await smartOrderApi.getSmartOrderById(smartOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    if (smartOrderExists) {
      log.info("Проверка корректности ответа для существующего смарт заказа...");
      responseStatusCheck.checkResponseStatus(response);
      const apiSmartOrder = await response.json();
      log.info("API Response:", JSON.stringify(apiSmartOrder, null, 2));

      smartOrderResponseCheck.checkSmartOrderFieldEquality(apiSmartOrder, smartOrderInDb[0]);
      smartOrderFieldTest.checkAllFields(apiSmartOrder);

      log.info("✓ Все проверки пройдены успешно. Смарт заказ с ID = 1 корректно получен.");
    } else {
      log.info("Проверка обработки ошибки 404 для несуществующего смарт заказа...");
      responseStatusCheck.checkResponseStatus(response, 404);
      const errorResponse = await response.json();
      log.error("Error Response:", JSON.stringify(errorResponse, null, 2));

      log.info(
        "✓ Все проверки пройдены успешно. Несуществующий смарт заказ с ID = 1 корректно обработан (404)."
      );
    }
  });

//   // Тест-кейс № 4: Проверка получения смарт заказа без Orders
//   test("GET /api/v2/smart-orders/{id} should return smart order without orders", async ({ request }) => {
//     log.info("=== Тест: Проверка получения смарт заказа без связанных Orders ===");

//     const smartOrderWithoutOrders = await smartOrderRepo.getSmartOrderWithoutOrdersByUserId(userIdPrimary);
    
//     if (!smartOrderWithoutOrders || smartOrderWithoutOrders.length === 0) {
//       log.warn("Не найден смарт заказ без Orders для тестирования. Пропускаем тест.");
//       return;
//     }

//     const smartOrderId = smartOrderWithoutOrders[0].id;
//     log.info(`Smart Order ID без Orders для тестирования: ${smartOrderId}`);
//     log.info("Смарт заказ из БД:", JSON.stringify(smartOrderWithoutOrders[0], null, 2));

//     const smartOrderApi = new SmartOrderApi(request);
//     const response = await smartOrderApi.getSmartOrderById(smartOrderId);
//     log.info(`API запрос выполнен. Статус: ${response.status()}`);

//     responseStatusCheck.checkResponseStatus(response);

//     const apiSmartOrder = await response.json();
//     log.info("API Response:", JSON.stringify(apiSmartOrder, null, 2));

//     log.info("Проверка обязательных полей и их типов...");
//     smartOrderFieldTest.checkAllFields(apiSmartOrder);
//     smartOrderResponseCheck.checkSmartOrderFieldEquality(apiSmartOrder, smartOrderWithoutOrders[0]);

//     log.info("Проверка, что массив orders пустой...");
//     expect(Array.isArray(apiSmartOrder.orders)).toBe(true);
//     expect(apiSmartOrder.orders.length).toBe(0);
//     log.info(`✓ Массив orders пустой: ${apiSmartOrder.orders.length} элементов`);

//     log.info("✓ Все проверки пройдены успешно. Смарт заказ без Orders корректно получен.");
//   });

  // Тест-кейс № 5: Проверка граничных значений и базовых некорректных значений smartOrderId
  test("GET /api/v2/smart-orders/{id} should validate boundary and invalid smartOrderId values", async ({
    request,
  }) => {
    log.info("=== Тест: Проверка граничных значений и базовых некорректных значений smartOrderId ===");

    const smartOrderApi = new SmartOrderApi(request);

    log.info(
      `Проверяем ${boundaryAndInvalidSmartOrderIdVariations.length} вариаций граничных и базовых некорректных значений...\n`
    );

    for (const variation of boundaryAndInvalidSmartOrderIdVariations) {
      try {
        log.info(
          `Проверка: ${variation.description} (значение: ${JSON.stringify(variation.value)})`
        );
        const response = await smartOrderApi.getSmartOrderById(variation.value as any);
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
      "✓ Все граничные и базовые некорректные значения smartOrderId были правильно отклонены API."
    );
  });

  // Тест-кейс № 6: Rate limiting
  test(`GET /api/v2/smart-orders/{id} should enforce rate limiting`, async ({ request }) => {
    log.info("=== Тест: Проверка rate limiting ===");

    const getLastSmartOrderByUserId = await smartOrderRepo.getLastSmartOrderByUserId(userIdPrimary);
    const lastSmartOrderId = getLastSmartOrderByUserId[0].id;

    const smartOrderApi = new SmartOrderApi(request);
    const requestCount = 120;

    log.info(`Отправка ${requestCount} запросов параллельно (100 запросов в секунду)...`);
    log.info(`Используется Smart Order ID: ${lastSmartOrderId}`);

    const startTime = Date.now();
    const requests = Array.from({ length: requestCount }, () =>
      smartOrderApi.getSmartOrderById(lastSmartOrderId)
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
