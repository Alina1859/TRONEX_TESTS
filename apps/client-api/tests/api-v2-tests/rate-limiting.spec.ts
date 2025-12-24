import { test } from "@playwright/test";
import { OrderRepository } from "@apps/client-api/repositories/order.repository";
import { SmartOrderRepository } from "@apps/client-api/repositories/smart-order.repository";
import { OrderApi } from "@apps/client-api/api/order.api";
import { SmartOrderApi } from "@apps/client-api/api/smart-order.api";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { OrderResponseCheck } from "@apps/client-api/test-objects/order-response-check";
import { SmartOrderResponseCheck } from "@apps/client-api/test-objects/smart-order-response-check";
import { log } from "@shared/utils/logger";
import { userIdPrimary } from "@apps/client-api/api/constants";

test.describe("rate limiting tests", () => {
  const orderRepo = new OrderRepository();
  const smartOrderRepo = new SmartOrderRepository();
  const responseStatusCheck = new ResponseStatusCheck();
  const orderResponseCheck = new OrderResponseCheck();
  const smartOrderResponseCheck = new SmartOrderResponseCheck();

  test("GET /api/v2/orders/{id} should enforce rate limiting", async ({ request }) => {
    log.info("=== Тест: Проверка rate limiting для GET /api/v2/orders/{id} ===");

    const getLastOrderByUserId = await orderRepo.getLastOrderByUserId(userIdPrimary);
    const lastOrderId = getLastOrderByUserId[0].id;

    const orderApi = new OrderApi(request);
    const requestCount = 120;

    log.info(`Отправка ${requestCount} запросов параллельно (100 запросов в секунду)...`);
    log.info(`Используется Order ID: ${lastOrderId}`);

    const startTime = Date.now();
    const requests = Array.from({ length: requestCount }, () => orderApi.getOrderById(lastOrderId));
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    log.info(`Все ${requestCount} запросов выполнены за ${duration.toFixed(2)} секунд`);

    const statusCounts = await responseStatusCheck.processRateLimitResponses(
      responses,
      requestCount
    );
    orderResponseCheck.checkRateLimitEnforcement(statusCounts);
  });

  test("GET /api/v2/orders/ should enforce rate limiting", async ({ request }) => {
    log.info("=== Тест: Проверка rate limiting для GET /api/v2/orders/ ===");

    const orderApi = new OrderApi(request);
    const requestCount = 120;

    log.info(`Отправка ${requestCount} запросов параллельно (100 запросов в секунду)...`);

    const startTime = Date.now();
    const requests = Array.from({ length: requestCount }, () => orderApi.getOrderList());
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    log.info(`Все ${requestCount} запросов выполнены за ${duration.toFixed(2)} секунд`);

    const statusCounts = await responseStatusCheck.processRateLimitResponses(
      responses,
      requestCount
    );
    orderResponseCheck.checkRateLimitEnforcement(statusCounts);
  });

  test("GET /api/v2/smart-orders/{id} should enforce rate limiting", async ({ request }) => {
    log.info("=== Тест: Проверка rate limiting для GET /api/v2/smart-orders/{id} ===");

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

    const statusCounts = await responseStatusCheck.processRateLimitResponses(
      responses,
      requestCount
    );
    smartOrderResponseCheck.checkRateLimitEnforcement(statusCounts);
  });
});
