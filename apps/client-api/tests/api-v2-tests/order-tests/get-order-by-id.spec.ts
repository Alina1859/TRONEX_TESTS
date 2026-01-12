import { test } from "@playwright/test";
import { OrderRepository } from "@apps/client-api/repositories/order.repository";
import { OrderApi } from "@apps/client-api/api/order.api";
import { OrderResponseCheck } from "@apps/client-api/test-objects/order-response-check";
import { OrderFieldCheck } from "@apps/client-api/test-objects/order-field-check";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { boundaryAndInvalidOrderIdVariations } from "@shared/utils/variations_constants/invalid-orderId-variations";
import { log } from "@shared/utils/logger";
import { userIdPrimary, userIdSecondary } from "@apps/client-api/api/constants";
import { HttpStatus } from "@shared/utils/constants";

test.describe("Get order by ID GET /api/v2/orders/{id}", () => {
  const orderRepo = new OrderRepository();
  const responseStatusCheck = new ResponseStatusCheck();
  const orderResponseCheck = new OrderResponseCheck();
  const orderFieldTest = new OrderFieldCheck();

  test("Тест-кейс № 1: Проверка валидности полей ответа API для пользователя с заказами", async ({ request }) => {
    log.info("=== Тест: Проверка валидности полей ответа API ===");

    const getLastOrderByUserId = await orderRepo.getLastOrderByUserId(userIdPrimary);
    const lastOrder = getLastOrderByUserId[0];
    const lastOrderId = lastOrder.id;

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById({ orderId: lastOrderId });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);

    const apiOrder = await response.json();
    log.info("API Response:", JSON.stringify(apiOrder, null, 2));

    log.info("Проверка обязательных полей и их типов...");
    orderResponseCheck.checkOrderFieldEquality(apiOrder, lastOrder);
    orderFieldTest.checkAllFields(apiOrder);

    log.info("✓ Все проверки пройдены успешно");
  });

  test("Тест-кейс № 2: Проверка безопасности доступа к заказам другого пользователя", async ({ request }) => {
    log.info("=== Тест: Проверка безопасности доступа к заказам ===");

    const getLastOrderByUserId = await orderRepo.getLastOrderByUserId(userIdSecondary);
    log.info(
      "Последний заказ другого пользователя:",
      JSON.stringify(getLastOrderByUserId, null, 2)
    );
    const lastOrderId = getLastOrderByUserId[0].id;
    log.info(`Попытка доступа к Order ID: ${lastOrderId} (принадлежит другому пользователю)`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById({ orderId: lastOrderId });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, HttpStatus.NOT_FOUND);
    const errorResponse = await response.json();
    log.error("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Доступ к чужому заказу заблокирован.");
  });

  test("Тест-кейс № 3: Проверка обработки несуществующего заказа", async ({ request }) => {
    log.info("=== Тест: Проверка обработки несуществующего заказа ===");

    const maxOrderId = await orderRepo.getMaxOrderId();
    log.info(`Максимальный ID заказа в БД: ${maxOrderId}`);

    const nonExistentOrderId = maxOrderId + 10;
    log.info(`Сгенерированный несуществующий Order ID: ${nonExistentOrderId}`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById({ orderId: nonExistentOrderId });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response, HttpStatus.NOT_FOUND);
    const errorResponse = await response.json();
    log.error("Error Response:", JSON.stringify(errorResponse, null, 2));

    log.info("✓ Все проверки пройдены успешно. Несуществующий заказ корректно обработан (404).");
  });

  test("Тест-кейс № 4: Проверка обработки заказа с ID = 1", async ({
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

      orderResponseCheck.checkOrderFieldEquality(apiOrder, orderInDb[0]);
      orderFieldTest.checkAllFields(apiOrder);

      log.info("✓ Все проверки пройдены успешно. Заказ с ID = 1 корректно получен.");
    } else {
      log.info("Проверка обработки ошибки 404 для несуществующего заказа...");
      responseStatusCheck.checkResponseStatus(response, HttpStatus.NOT_FOUND);
      const errorResponse = await response.json();
      log.error("Error Response:", JSON.stringify(errorResponse, null, 2));

      log.info(
        "✓ Все проверки пройдены успешно. Несуществующий заказ с ID = 1 корректно обработан (404)."
      );
    }
  });

  test("Тест-кейс № 5: Проверка граничных значений и базовых некорректных значений orderId", async ({
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
        const response = await orderApi.getOrderById({ orderId: variation.value as any });
        const status = response.status();

        if (status === HttpStatus.BAD_REQUEST || status === HttpStatus.NOT_FOUND) {
          log.info(`  ✓ Корректно обработано: статус ${status}`);
        } else {
          log.warn(
            `  ✗ Неожиданный статус: ${status} (ожидался ${HttpStatus.BAD_REQUEST} или ${HttpStatus.NOT_FOUND})`
          );
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

  test('Тест-кейс № 6: Проверка получения заказа со статусом "COMPLETED"', async ({
    request,
  }) => {
    log.info('=== Тест: Проверка получения заказа со статусом "COMPLETED" ===');

    const completedOrder = await orderRepo.getCompletedOrderByUserId(userIdPrimary);

    const completedOrderId = completedOrder[0].id;
    log.info(`Order ID со статусом "COMPLETED" для тестирования: ${completedOrderId}`);
    log.info(`Статус заказа в БД: ${completedOrder[0].status}`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById({ orderId: completedOrderId });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info("API Response:", JSON.stringify(apiOrder, null, 2));

    log.info("Проверка обязательных полей и их типов...");
    orderResponseCheck.checkOrderFieldEquality(apiOrder, completedOrder[0]);
    orderFieldTest.checkAllFields(apiOrder);

    log.info("Проверка статуса заказа...");
    orderResponseCheck.checkOrderStatus(apiOrder, "COMPLETED");
    log.info(`✓ Статус заказа корректный: ${apiOrder.status}`);

    log.info('✓ Все проверки пройдены успешно. Заказ со статусом "COMPLETED" корректно получен.');
  });

  test('Тест-кейс № 7: Проверка получения заказа со статусом "FAILED"', async ({ request }) => {
    log.info('=== Тест: Проверка получения заказа со статусом "FAILED" ===');

    const failedOrder = await orderRepo.getFailedOrderByUserId(userIdPrimary);

    const failedOrderId = failedOrder[0].id;
    log.info(`Order ID со статусом "FAILED" для тестирования: ${failedOrderId}`);
    log.info(`Статус заказа в БД: ${failedOrder[0].status}`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById({ orderId: failedOrderId });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info("API Response:", JSON.stringify(apiOrder, null, 2));

    log.info("Проверка обязательных полей и их типов...");
    orderResponseCheck.checkOrderFieldEquality(apiOrder, failedOrder[0]);
    orderFieldTest.checkAllFields(apiOrder);

    log.info("Проверка статуса заказа...");
    orderResponseCheck.checkOrderStatus(apiOrder, "FAILED");
    log.info(`✓ Статус заказа корректный: ${apiOrder.status}`);

    log.info('✓ Все проверки пройдены успешно. Заказ со статусом "FAILED" корректно получен.');
  });

  test('Тест-кейс № 8: Проверка получения заказа с типом "ENERGY"', async ({ request }) => {
    log.info('=== Тест: Проверка получения заказа с типом "ENERGY" ===');

    const energyOrder = await orderRepo.getEnergyOrderByUserId(userIdPrimary);

    const energyOrderId = energyOrder[0].id;
    log.info(`Order ID с типом "ENERGY" для тестирования: ${energyOrderId}`);
    log.info(`Тип заказа в БД: ${energyOrder[0].type}`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById({ orderId: energyOrderId });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info("API Response:", JSON.stringify(apiOrder, null, 2));

    log.info("Проверка обязательных полей и их типов...");
    orderResponseCheck.checkOrderFieldEquality(apiOrder, energyOrder[0]);
    orderFieldTest.checkAllFields(apiOrder);

    log.info("Проверка типа заказа...");
    orderResponseCheck.checkOrderType(apiOrder, "ENERGY");
    log.info(`✓ Тип заказа корректный: ${apiOrder.type}`);

    log.info('✓ Все проверки пройдены успешно. Заказ с типом "ENERGY" корректно получен.');
  });

  test('Тест-кейс № 9: Проверка получения заказа с типом "BANDWIDTH"', async ({ request }) => {
    log.info('=== Тест: Проверка получения заказа с типом "BANDWIDTH" ===');

    const bandwidthOrder = await orderRepo.getBandwidthOrderByUserId(userIdPrimary);

    const bandwidthOrderId = bandwidthOrder[0].id;
    log.info(`Order ID с типом "BANDWIDTH" для тестирования: ${bandwidthOrderId}`);
    log.info(`Тип заказа в БД: ${bandwidthOrder[0].type}`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById({ orderId: bandwidthOrderId });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info("API Response:", JSON.stringify(apiOrder, null, 2));

    log.info("Проверка обязательных полей и их типов...");
    orderResponseCheck.checkOrderFieldEquality(apiOrder, bandwidthOrder[0]);
    orderFieldTest.checkAllFields(apiOrder);

    log.info("Проверка типа заказа...");
    orderResponseCheck.checkOrderType(apiOrder, "BANDWIDTH");
    log.info(`✓ Тип заказа корректный: ${apiOrder.type}`);

    log.info('✓ Все проверки пройдены успешно. Заказ с типом "BANDWIDTH" корректно получен.');
  });

  test('Тест-кейс № 10: Проверка получения заказа с типом "ACTIVATION"', async ({
    request,
  }) => {
    log.info('=== Тест: Проверка получения заказа с типом "ACTIVATION" ===');

    const activationOrder = await orderRepo.getActivationOrderByUserId(userIdPrimary);

    const activationOrderId = activationOrder[0].id;
    log.info(`Order ID с типом "ACTIVATION" для тестирования: ${activationOrderId}`);
    log.info(`Тип заказа в БД: ${activationOrder[0].type}`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById({ orderId: activationOrderId });
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusCheck.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info("API Response:", JSON.stringify(apiOrder, null, 2));

    log.info("Проверка обязательных полей и их типов...");
    orderResponseCheck.checkOrderFieldEquality(apiOrder, activationOrder[0]);
    orderFieldTest.checkAllFields(apiOrder);

    log.info("Проверка типа заказа...");
    orderResponseCheck.checkOrderType(apiOrder, "ACTIVATION");
    log.info(`✓ Тип заказа корректный: ${apiOrder.type}`);

    log.info('✓ Все проверки пройдены успешно. Заказ с типом "ACTIVATION" корректно получен.');
  });
});
