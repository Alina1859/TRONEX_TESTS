import { test, expect } from "@playwright/test";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { log } from "@shared/utils/logger";
import { createWallet } from "@apps/client-api/repositories/tronweb";
import { getHeaders, getPostHeaders } from "@shared/utils/headers";
import * as dotenv from "dotenv";

dotenv.config();

const apiUrl = process.env.API_URL!;
const validOrderId = 1;

test.describe("API Key Validation", () => {
  const responseStatusCheck = new ResponseStatusCheck();

  test("GET /api/v2/orders/{id} should return 401 for empty API key", async ({ request }) => {
    log.info("=== Тест: Проверка отправки пустого API ключа ===");

    const response = await request.get(`${apiUrl}/api/v2/orders/${validOrderId}`, {
      headers: getHeaders(""),
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
      headers: getHeaders(invalidApiKey),
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Невалидный API ключ корректно отклонен (401).");
  });

  test("GET /api/v2/orders should return 401 for empty API key", async ({ request }) => {
    log.info("=== Тест: Проверка отправки пустого API ключа для списка заказов ===");

    const response = await request.get(`${apiUrl}/api/v2/orders`, {
      headers: getHeaders(""),
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
      headers: getHeaders(invalidApiKey),
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Невалидный API ключ корректно отклонен (401).");
  });

  test("POST /api/v2/orders/ should return 401 for empty API key", async ({ request }) => {
    log.info("=== Тест: Проверка отправки пустого API ключа для создания ордера ===");

    const wallet = await createWallet();
    const createOrderRequest = {
      type: "ACTIVATION",
      targetAddress: wallet.address?.base58 || "",
    };

    const response = await request.post(`${apiUrl}/api/v2/orders/`, {
      headers: getPostHeaders(""),
      data: createOrderRequest,
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);
    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Пустой API ключ корректно отклонен (401).");
  });

  test("POST /api/v2/orders/ should return 401 for invalid API key", async ({ request }) => {
    log.info("=== Тест: Проверка отправки невалидного API ключа для создания ордера ===");

    const wallet = await createWallet();
    const createOrderRequest = {
      type: "ACTIVATION",
      targetAddress: wallet.address?.base58 || "",
    };

    const invalidApiKey = "invalid_api_key_12345";
    log.info(`Используется невалидный API ключ: ${invalidApiKey}`);

    const response = await request.post(`${apiUrl}/api/v2/orders/`, {
      headers: getPostHeaders(invalidApiKey),
      data: createOrderRequest,
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);
    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Невалидный API ключ корректно отклонен (401).");
  });

  test("POST /api/v2/orders/ should reject request without Content-Type", async ({ request }) => {
    log.info("=== Тест: Проверка отправки запроса создания ордера без Content-Type ===");

    const validApiKey = process.env.API_KEY_PRIMARY!;

    const wallet = await createWallet();
    const createOrderRequest = {
      type: "ACTIVATION",
      targetAddress: wallet.address?.base58 || "",
    };

    const response = await request.post(`${apiUrl}/api/v2/orders/`, {
      headers: {
        Accept: "application/json",
        "X-API-KEY": validApiKey,
      },
      data: JSON.stringify(createOrderRequest),
    });

    const status = response.status();
    log.info(`API запрос выполнен. Статус: ${status}`);

    expect([400, 415]).toContain(status);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Запрос без Content-Type корректно отклонен.");
  });

  test("GET /api/v2/smart-orders/{smartOrderId} should return 401 for empty API key", async ({
    request,
  }) => {
    log.info("=== Тест: Проверка отправки пустого API ключа для smart order ===");

    const response = await request.get(`${apiUrl}/api/v2/smart-orders/${validOrderId}`, {
      headers: getHeaders(""),
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Пустой API ключ корректно отклонен (401).");
  });

  test("GET /api/v2/smart-orders/{smartOrderId} should return 401 for invalid API key", async ({
    request,
  }) => {
    log.info("=== Тест: Проверка отправки невалидного API ключа для smart order ===");

    const invalidApiKey = "invalid_api_key_12345";
    log.info(`Используется невалидный API ключ: ${invalidApiKey}`);

    const response = await request.get(`${apiUrl}/api/v2/smart-orders/${validOrderId}`, {
      headers: getHeaders(invalidApiKey),
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Невалидный API ключ корректно отклонен (401).");
  });
});
