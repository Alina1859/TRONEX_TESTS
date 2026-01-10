import { test, expect } from "@playwright/test";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { log } from "@shared/utils/logger";
import { createWallet } from "@apps/client-api/repositories/tronweb";
import { OrderApi } from "@apps/client-api/api/order.api";
import { SmartOrderApi } from "@apps/client-api/api/smart-order.api";
import * as dotenv from "dotenv";
import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE,
  validOrderId,
} from "@shared/utils/constants";

dotenv.config();

test.describe("API key validation", () => {
  const responseStatusCheck = new ResponseStatusCheck();
  let orderApi: OrderApi;
  let smartOrderApi: SmartOrderApi;

  test.beforeEach(async ({ request }) => {
    orderApi = new OrderApi(request);
    smartOrderApi = new SmartOrderApi(request);
  });

  test("GET /api/v2/orders/{id} should return 401 for empty API key", async () => {
    log.info("=== Тест: Проверка отправки пустого API ключа ===");

    const response = await orderApi.getOrderByIdWithApiKey(validOrderId, "");

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Пустой API ключ корректно отклонен (401).");
  });

  test("GET /api/v2/orders/{id} should return 401 for invalid API key", async () => {
    log.info("=== Тест: Проверка отправки невалидного API ключа ===");

    const invalidApiKey = "invalid_api_key_12345";
    log.info(`Используется невалидный API ключ: ${invalidApiKey}`);

    const response = await orderApi.getOrderByIdWithApiKey(validOrderId, invalidApiKey);

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Невалидный API ключ корректно отклонен (401).");
  });

  test("GET /api/v2/orders should return 401 for empty API key", async () => {
    log.info("=== Тест: Проверка отправки пустого API ключа для списка заказов ===");

    const response = await orderApi.getOrderListWithApiKey("");

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Пустой API ключ корректно отклонен (401).");
  });

  test("GET /api/v2/orders should return 401 for invalid API key", async () => {
    log.info("=== Тест: Проверка отправки невалидного API ключа для списка заказов ===");

    const invalidApiKey = "invalid_api_key_12345";
    log.info(`Используется невалидный API ключ: ${invalidApiKey}`);

    const response = await orderApi.getOrderListWithApiKey(invalidApiKey);

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Невалидный API ключ корректно отклонен (401).");
  });

  test("POST /api/v2/orders/ should return 401 for empty API key", async () => {
    log.info("=== Тест: Проверка отправки пустого API ключа для создания ордера ===");

    const wallet = await createWallet();
    const createOrderRequest = {
      type: "ACTIVATION",
      targetAddress: wallet.address?.base58 || "",
    };

    const response = await orderApi.createNewOrderWithApiKey(createOrderRequest, "");

    log.info(`API запрос выполнен. Статус: ${response.status()}`);
    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Пустой API ключ корректно отклонен (401).");
  });

  test("POST /api/v2/orders/ should return 401 for invalid API key", async () => {
    log.info("=== Тест: Проверка отправки невалидного API ключа для создания ордера ===");

    const wallet = await createWallet();
    const createOrderRequest = {
      type: "ACTIVATION",
      targetAddress: wallet.address?.base58 || "",
    };

    const invalidApiKey = "invalid_api_key_12345";
    log.info(`Используется невалидный API ключ: ${invalidApiKey}`);

    const response = await orderApi.createNewOrderWithApiKey(createOrderRequest, invalidApiKey);

    log.info(`API запрос выполнен. Статус: ${response.status()}`);
    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Невалидный API ключ корректно отклонен (401).");
  });

  test("POST /api/v2/orders/ should reject request without Content-Type", async () => {
    log.info("=== Тест: Проверка отправки запроса создания ордера без Content-Type ===");

    const validApiKey = process.env.API_KEY_PRIMARY!;

    const wallet = await createWallet();
    const createOrderRequest = {
      type: "ACTIVATION",
      targetAddress: wallet.address?.base58 || "",
    };

    const response = await orderApi.createNewOrderWithoutContentType(
      createOrderRequest,
      validApiKey
    );

    const status = response.status();
    log.info(`API запрос выполнен. Статус: ${status}`);

    expect([HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE]).toContain(status);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Запрос без Content-Type корректно отклонен.");
  });

  test("GET /api/v2/smart-orders/{smartOrderId} should return 401 for empty API key", async () => {
    log.info("=== Тест: Проверка отправки пустого API ключа для smart order ===");

    const response = await smartOrderApi.getSmartOrderByIdWithApiKey(validOrderId, "");

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Пустой API ключ корректно отклонен (401).");
  });

  test("GET /api/v2/smart-orders/{smartOrderId} should return 401 for invalid API key", async () => {
    log.info("=== Тест: Проверка отправки невалидного API ключа для smart order ===");

    const invalidApiKey = "invalid_api_key_12345";
    log.info(`Используется невалидный API ключ: ${invalidApiKey}`);

    const response = await smartOrderApi.getSmartOrderByIdWithApiKey(validOrderId, invalidApiKey);

    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Невалидный API ключ корректно отклонен (401).");
  });

  test("POST /api/v2/smart-orders/ should return 401 for empty API key", async () => {
    log.info("=== Тест: Проверка отправки пустого API ключа для создания smart order ===");

    const fromWallet = await createWallet();
    const toWallet = await createWallet();
    const createSmartOrderRequest = {
      fromAddress: fromWallet.address?.base58 || "",
      toAddress: toWallet.address?.base58 || "",
      withActivation: true,
      withEnergy: true,
      withBandwidth: true,
    };

    const response = await smartOrderApi.createNewSmartOrderWithApiKey(createSmartOrderRequest, "");

    log.info(`API запрос выполнен. Статус: ${response.status()}`);
    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Пустой API ключ корректно отклонен (401).");
  });

  test("POST /api/v2/smart-orders/ should return 401 for invalid API key", async () => {
    log.info("=== Тест: Проверка отправки невалидного API ключа для создания smart order ===");

    const fromWallet = await createWallet();
    const toWallet = await createWallet();
    const createSmartOrderRequest = {
      fromAddress: fromWallet.address?.base58 || "",
      toAddress: toWallet.address?.base58 || "",
      withActivation: true,
      withEnergy: true,
      withBandwidth: true,
    };

    const invalidApiKey = "invalid_api_key_12345";
    log.info(`Используется невалидный API ключ: ${invalidApiKey}`);

    const response = await smartOrderApi.createNewSmartOrderWithApiKey(
      createSmartOrderRequest,
      invalidApiKey
    );

    log.info(`API запрос выполнен. Статус: ${response.status()}`);
    responseStatusCheck.checkResponseStatus(response, 401);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Невалидный API ключ корректно отклонен (401).");
  });

  test("POST /api/v2/smart-orders/ should reject request without Content-Type", async () => {
    log.info("=== Тест: Проверка отправки запроса создания smart order без Content-Type ===");

    const validApiKey = process.env.API_KEY_PRIMARY!;

    const fromWallet = await createWallet();
    const toWallet = await createWallet();
    const createSmartOrderRequest = {
      fromAddress: fromWallet.address?.base58 || "",
      toAddress: toWallet.address?.base58 || "",
      withActivation: true,
      withEnergy: true,
      withBandwidth: true,
    };

    const response = await smartOrderApi.createNewSmartOrderWithoutContentType(
      createSmartOrderRequest,
      validApiKey
    );

    const status = response.status();
    log.info(`API запрос выполнен. Статус: ${status}`);

    expect([HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE]).toContain(status);

    const errorResponse = await response.json();
    log.info("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Запрос без Content-Type корректно отклонен.");
  });
});
