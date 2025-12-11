import { test } from "@playwright/test";
import { ResponseStatusCheck } from "../test-objects/response-status-check";
import { log } from "../../../shared/utils/logger";
import * as dotenv from "dotenv";

dotenv.config();

const apiUrl = process.env.API_URL!;
const validOrderId = 1;

test.describe("API Key Validation", () => {
  const responseStatusCheck = new ResponseStatusCheck();

  // Тестирует корректность работы эндпоинта GET /api/v2/orders/{id}
  test("GET /api/v2/orders/{id} should return 401 for empty API key", async ({ request }) => {
    log.info("=== Тест: Проверка отправки пустого API ключа ===");

    const response = await request.get(`${apiUrl}/api/v2/orders/${validOrderId}`, {
      headers: {
        Accept: "application/json",
        "X-API-KEY": "",
      },
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Пустой API ключ корректно отклонен (401).");
  });

  test("GET /api/v2/orders/{id} should return 401 for invalid API key", async ({ request }) => {
    log.info("=== Тест: Проверка отправки невалидного API ключа ===");

    const invalidApiKey = "invalid_api_key_12345";
    log.info(`Используется невалидный API ключ: ${invalidApiKey}`);

    const response = await request.get(`${apiUrl}/api/v2/orders/${validOrderId}`, {
      headers: {
        Accept: "application/json",
        "X-API-KEY": invalidApiKey,
      },
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Невалидный API ключ корректно отклонен (401).");
  });

  // Тестирует корректность работы эндпоинта GET /api/v2/orders
  test("GET /api/v2/orders should return 401 for empty API key", async ({ request }) => {
    log.info("=== Тест: Проверка отправки пустого API ключа для списка заказов ===");

    const response = await request.get(`${apiUrl}/api/v2/orders`, {
      headers: {
        Accept: "application/json",
        "X-API-KEY": "",
      },
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Пустой API ключ корректно отклонен (401).");
  });

  test("GET /api/v2/orders should return 401 for invalid API key", async ({ request }) => {
    log.info("=== Тест: Проверка отправки невалидного API ключа для списка заказов ===");

    const invalidApiKey = "invalid_api_key_12345";
    log.info(`Используется невалидный API ключ: ${invalidApiKey}`);

    const response = await request.get(`${apiUrl}/api/v2/orders`, {
      headers: {
        Accept: "application/json",
        "X-API-KEY": invalidApiKey,
      },
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Невалидный API ключ корректно отклонен (401).");
  });
});
