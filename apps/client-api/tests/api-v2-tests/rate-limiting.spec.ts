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
import { calculateExecutionTime } from "@shared/helpers/execution-time-helper";
import { RATE_LIMIT_TEST_REQUEST_COUNT } from "@shared/utils/constants";

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

    log.info(
      `Отправка ${RATE_LIMIT_TEST_REQUEST_COUNT} запросов параллельно (100 запросов в секунду)...`
    );
    log.info(`Используется Order ID: ${lastOrderId}`);

    const requests = Array.from({ length: RATE_LIMIT_TEST_REQUEST_COUNT }, () =>
      orderApi.getOrderById({ orderId: lastOrderId })
    );
    const responses = await calculateExecutionTime(
      () => Promise.all(requests),
      RATE_LIMIT_TEST_REQUEST_COUNT
    );

    const statusCounts = await responseStatusCheck.processRateLimitResponses(
      responses,
      RATE_LIMIT_TEST_REQUEST_COUNT
    );
    orderResponseCheck.checkRateLimitEnforcement(statusCounts);
  });

  test("GET /api/v2/orders/ should enforce rate limiting", async ({ request }) => {
    log.info("=== Тест: Проверка rate limiting для GET /api/v2/orders/ ===");

    const orderApi = new OrderApi(request);

    log.info(
      `Отправка ${RATE_LIMIT_TEST_REQUEST_COUNT} запросов параллельно (100 запросов в секунду)...`
    );

    const requests = Array.from({ length: RATE_LIMIT_TEST_REQUEST_COUNT }, () =>
      orderApi.getOrderList({})
    );
    const responses = await calculateExecutionTime(
      () => Promise.all(requests),
      RATE_LIMIT_TEST_REQUEST_COUNT
    );

    const statusCounts = await responseStatusCheck.processRateLimitResponses(
      responses,
      RATE_LIMIT_TEST_REQUEST_COUNT
    );
    orderResponseCheck.checkRateLimitEnforcement(statusCounts);
  });

  test("GET /api/v2/smart-orders/{id} should enforce rate limiting", async ({ request }) => {
    log.info("=== Тест: Проверка rate limiting для GET /api/v2/smart-orders/{id} ===");

    const getLastSmartOrderByUserId = await smartOrderRepo.getLastSmartOrderByUserId(userIdPrimary);
    const lastSmartOrderId = getLastSmartOrderByUserId[0].id;

    const smartOrderApi = new SmartOrderApi(request);

    log.info(
      `Отправка ${RATE_LIMIT_TEST_REQUEST_COUNT} запросов параллельно (100 запросов в секунду)...`
    );
    log.info(`Используется Smart Order ID: ${lastSmartOrderId}`);

    const requests = Array.from({ length: RATE_LIMIT_TEST_REQUEST_COUNT }, () =>
      smartOrderApi.getSmartOrderById({ smartOrderId: lastSmartOrderId })
    );
    const responses = await calculateExecutionTime(
      () => Promise.all(requests),
      RATE_LIMIT_TEST_REQUEST_COUNT
    );

    const statusCounts = await responseStatusCheck.processRateLimitResponses(
      responses,
      RATE_LIMIT_TEST_REQUEST_COUNT
    );
    smartOrderResponseCheck.checkRateLimitEnforcement(statusCounts);
  });
});
