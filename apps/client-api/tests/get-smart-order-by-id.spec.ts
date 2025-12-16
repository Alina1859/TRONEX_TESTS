import { test, expect } from "@playwright/test";
import { SmartOrderRepository } from "../repositories/smart-order.repository";
// import { SmartOrderResponseCheck } from "../test-objects/smart-order-response-check";
import { OrderFieldCheck } from "../test-objects/order-field-check";
import { ResponseStatusCheck } from "../test-objects/response-status-check";
import { boundaryAndInvalidOrderIdVariations } from "../test-objects/invalid-orderId-variations";
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
});
