import { test, expect } from "@playwright/test";
import { createWallet } from "@apps/client-api/repositories/tronweb";
import { log } from "@shared/utils/logger";
import { SmartOrderFieldCheck } from "@apps/client-api/test-objects/smart-order-check/smart-order-field-check";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { SmartOrderResponseCheck } from "@apps/client-api/test-objects/smart-order-check/smart-order-response-check";
import { SmartOrderApi } from "@apps/client-api/api/smart-order.api";
import { SmartOrderRepository } from "@apps/client-api/repositories/smart-order.repository";
import { SmartOrderWithOrders } from "@shared/utils/types";

test.describe("Create new smart order", () => {
  const smartOrderFieldCheck = new SmartOrderFieldCheck();
  const smartOrderResponseCheck = new SmartOrderResponseCheck();
  const statusCheck = new ResponseStatusCheck();
  const smartOrderRepo = new SmartOrderRepository();

  // Тест-кейс № 1: Проверка создания нового smart order и валидации полей ответа
  test("POST /api/v2/smart-orders/ should return valid smart order fields", async ({
    request,
  }) => {
    log.info("=== Тест: Создание нового smart order ===");

    const smartOrderApi = new SmartOrderApi(request);

    // Создаем два кошелька: fromAddress и toAddress
    const fromWallet = await createWallet();
    const toWallet = await createWallet();
    const fromAddress = fromWallet.address?.base58 || "";
    const toAddress = toWallet.address?.base58 || "";

    log.info(`Создан кошелек fromAddress: ${fromAddress}`);
    log.info(`Создан кошелек toAddress: ${toAddress}`);

    expect(fromAddress).not.toBe("");
    expect(toAddress).not.toBe("");

    // Создаем запрос на создание smart order
    const smartOrderRequest = {
      fromAddress,
      toAddress,
      withActivation: true,
      withEnergy: true,
      withBandwidth: true,
    };

    log.info(
      `Отправка запроса на создание smart order: ${JSON.stringify(smartOrderRequest, null, 2)}`
    );

    const response = await smartOrderApi.createNewSmartOrder(smartOrderRequest);
    const responseStatus = response.status();
    log.info(`API запрос выполнен. Статус: ${responseStatus}`);

    statusCheck.checkResponseStatus(response);

    const apiSmartOrder = (await response.json()) as SmartOrderWithOrders;
    log.info(`API Response: ${JSON.stringify(apiSmartOrder, null, 2)}`);

    // Проверка всех полей ответа
    log.info("Проверка обязательных полей и их типов...");
    smartOrderFieldCheck.checkAllFields(apiSmartOrder);

    // Проверка соответствия значений полей запроса и ответа
    expect(apiSmartOrder.fromAddress).toBe(fromAddress);
    expect(apiSmartOrder.toAddress).toBe(toAddress);
    expect(apiSmartOrder.withActivation).toBe(true);
    expect(apiSmartOrder.withEnergy).toBe(true);
    expect(apiSmartOrder.withBandwidth).toBe(true);

    // Проверка статуса (должен быть INIT при создании)
    expect(apiSmartOrder.status).toBe("INIT");

    // Проверка наличия массива orders (может быть пустым на начальном этапе)
    expect(Array.isArray(apiSmartOrder.orders)).toBe(true);

    // Проверка в БД
    const dbRows = await smartOrderRepo.getSmartOrderById(apiSmartOrder.id);
    expect(dbRows.length).toBeGreaterThan(0);
    const dbSmartOrder = dbRows[0];

    log.info(`Smart Order из БД: ${JSON.stringify(dbSmartOrder, null, 2)}`);

    // Сравнение полей API ответа с данными из БД
    expect(apiSmartOrder.id).toBe(dbSmartOrder.id);
    expect(apiSmartOrder.status).toBe(dbSmartOrder.status);
    expect(apiSmartOrder.fromAddress).toBe(dbSmartOrder.fromAddress);
    expect(apiSmartOrder.toAddress).toBe(dbSmartOrder.toAddress);
    expect(apiSmartOrder.withActivation).toBe(dbSmartOrder.withActivation);
    expect(apiSmartOrder.withEnergy).toBe(dbSmartOrder.withEnergy);
    expect(apiSmartOrder.withBandwidth).toBe(dbSmartOrder.withBandwidth);

    log.info("✓ Все проверки полей ответа после создания smart order пройдены");
  });
});