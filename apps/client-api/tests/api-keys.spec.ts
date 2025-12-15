import { test, expect } from "@playwright/test";
import { ResponseStatusCheck } from "../test-objects/response-status-check";
import { log } from "../../../shared/utils/logger";
import { createWallet } from "../repositories/tronweb";
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

  // Тестирует корректность работы эндпоинта POST /api/v2/orders/
  test("POST /api/v2/orders/ should return 401 for empty API key", async ({ request }) => {
    log.info("=== Тест: Проверка отправки пустого API ключа для создания ордера ===");

    const wallet = await createWallet();
    const createOrderRequest = {
      type: "ACTIVATION",
      targetAddress: wallet.address?.base58 || "",
    };

    const response = await request.post(`${apiUrl}/api/v2/orders/`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": "",
      },
      data: createOrderRequest,
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);
    responseStatusCheck.checkResponseStatus(response, 401);

    const headers = response.headers();
    const contentType = headers["content-type"] ?? headers["Content-Type"] ?? "";

    if (contentType.includes("application/json")) {
      const errorResponse = await response.json().catch(() => undefined);
      log.info("Error Response:", JSON.stringify(errorResponse, null, 2));
    } else {
      const errorText = await response.text().catch(() => "");
      log.info(`Error Response (text): ${errorText}`);
    }

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
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": invalidApiKey,
      },
      data: createOrderRequest,
    });

    log.info(`API запрос выполнен. Статус: ${response.status()}`);
    responseStatusCheck.checkResponseStatus(response, 401);

    const headers = response.headers();
    const contentType = headers["content-type"] ?? headers["Content-Type"] ?? "";

    if (contentType.includes("application/json")) {
      const errorResponse = await response.json().catch(() => undefined);
      log.info("Error Response:", JSON.stringify(errorResponse, null, 2));
    } else {
      const errorText = await response.text().catch(() => "");
      log.info(`Error Response (text): ${errorText}`);
    }

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

    const headers = response.headers();
    const contentType = headers["content-type"] ?? headers["Content-Type"] ?? "";

    if (contentType.includes("application/json")) {
      const errorResponse = await response.json().catch(() => undefined);
      log.info("Error Response:", JSON.stringify(errorResponse, null, 2));
    } else {
      const errorText = await response.text().catch(() => "");
      log.info(`Error Response (text): ${errorText}`);
    }

    log.info("✓ Все проверки пройдены успешно. Запрос без Content-Type корректно отклонен.");
  });
});
