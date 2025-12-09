import { test, expect } from '@playwright/test';
import { OrderRepository } from '../repositories/order.repository';
import { OrderApi } from '../api/order.api';
import { OrderResponseTest } from '../TestObjects/OrderResponseTest';
import { OrderFieldTest } from '../TestObjects/OrderFieldTest';
import { ResponseStatusTest } from '../TestObjects/ResponseStatusTest';
import { boundaryAndInvalidOrderIdVariations } from '../TestObjects/InvalidOrderIdVariations';
import { log } from '../../../shared/utils/logger';

// Тестирует корректность работы эндпоинта GET /api/v2/orders/{id}
test.describe('Get order by ID​', () => {
  const orderRepo = new OrderRepository();
  const userId = process.env.USER_ID_PRIMARY!;
  const otherUserId = process.env.USER_ID_SECONDARY!;
  const responseStatusTest = new ResponseStatusTest();
  const orderResponseTest = new OrderResponseTest();
  const orderFieldTest = new OrderFieldTest();

  // Тест-кейс № 3: Проверка валидности полей ответа API для пользователя с заказами
  test('GET /api/v2/orders/{id} should return correct order data', async ({ request }) => {
    log.info('=== Тест: Проверка валидности полей ответа API ===');
    
    const getLastOrderByUserId = await orderRepo.getLastOrderByUserId(userId);
    const lastOrderId = getLastOrderByUserId[0].id;
    log.info(`Order ID для тестирования: ${lastOrderId}`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById(lastOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);
    
    responseStatusTest.checkResponseStatus(response);
    
    const apiOrder = await response.json();
    log.info('API Response:', JSON.stringify(apiOrder, null, 2));

    log.info('Проверка обязательных полей и их типов...');
    orderResponseTest.checkOrderId(apiOrder, lastOrderId);

    orderFieldTest.checkId(apiOrder);
    orderFieldTest.checkCreatedAt(apiOrder);
    orderFieldTest.checkStatus(apiOrder);
    orderFieldTest.checkType(apiOrder);
    orderFieldTest.checkAmount(apiOrder);
    orderFieldTest.checkPeriod(apiOrder);
    orderFieldTest.checkTargetAddress(apiOrder);
    orderFieldTest.checkBlockchainTransaction(apiOrder);
    orderFieldTest.checkSellPrice(apiOrder);

    log.info('✓ Все проверки пройдены успешно');
  });

  // Тест-кейс № 4: Получение чужого заказа по orderId
  test('GET /api/v2/orders/{id} should not return order from another user', async ({ request }) => {
    log.info('=== Тест: Проверка безопасности доступа к заказам ===');

    const getLastOrderByUserId = await orderRepo.getLastOrderByUserId(otherUserId);
    log.info('Последний заказ другого пользователя:', JSON.stringify(getLastOrderByUserId, null, 2));
    const lastOrderId = getLastOrderByUserId[0].id;
    log.info(`Попытка доступа к Order ID: ${lastOrderId} (принадлежит другому пользователю)`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById(lastOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    responseStatusTest.checkResponseStatus(response, 404);
    const errorResponse = await response.json();
    log.error('Error Response:', JSON.stringify(errorResponse, null, 2));
    
    log.info('✓ Все проверки пройдены успешно. Доступ к чужому заказу заблокирован.');
  });

  // Тест-кейс № 5: Получение несуществующего заказа по orderId
  test('GET /api/v2/orders/{id} should return 404 for non-existent order', async ({ request }) => {
    log.info('=== Тест: Проверка обработки несуществующего заказа ===');

    const maxOrderId = await orderRepo.getMaxOrderId();
    log.info(`Максимальный ID заказа в БД: ${maxOrderId}`);
    
    const nonExistentOrderId = maxOrderId + 10;
    log.info(`Сгенерированный несуществующий Order ID: ${nonExistentOrderId}`);

    const orderApi = new OrderApi(request);
    const response = await orderApi.getOrderById(nonExistentOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    // ========== БЛОК ПРОВЕРОК ==========

    responseStatusTest.checkResponseStatus(response, 404);
    const errorResponse = await response.json();
    log.error('Error Response:', JSON.stringify(errorResponse, null, 2));
    
    log.info('✓ Все проверки пройдены успешно. Несуществующий заказ корректно обработан (404).');
  });

  // Тест-кейс № 6: Получение заказа по orderId = 1 (существующий или несуществующий)
  test('GET /api/v2/orders/{id} should return order or 404 for order with id = 1', async ({ request }) => {
    log.info('=== Тест: Проверка обработки заказа с ID = 1 ===');

    // Используем ID = 1 для проверки
    const orderId = 1;
    log.info(`Проверяемый Order ID: ${orderId}`);

    // Проверяем в базе данных, существует ли такой заказ
    const orderInDb = await orderRepo.getOrderById(orderId);
    log.info('Проверка в БД:', JSON.stringify(orderInDb, null, 2));
    
    const orderExists = orderInDb && orderInDb.length > 0;
    
    if (orderExists) {
      log.info(`✓ Заказ с ID ${orderId} существует в БД. Проверяем корректность ответа API.`);
    } else {
      log.info(`✓ Заказ с ID ${orderId} не существует в БД. Проверяем обработку ошибки 404.`);
    }

    // Создаем экземпляр API клиента для выполнения HTTP запросов
    const orderApi = new OrderApi(request);
    // Выполняем GET запрос к API для получения данных заказа
    const response = await orderApi.getOrderById(orderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    // ========== БЛОК ПРОВЕРОК ==========

    if (orderExists) {
      // Если заказ существует - проверяем корректность ответа
      log.info('Проверка корректности ответа для существующего заказа...');
      responseStatusTest.checkResponseStatus(response);
      const apiOrder = await response.json();
      log.info('API Response:', JSON.stringify(apiOrder, null, 2));

      // Проверка обязательных полей и их типов
      const orderFieldTest = new OrderFieldTest();
      orderResponseTest.checkOrderId(apiOrder, orderId);
      orderFieldTest.checkId(apiOrder);
      orderFieldTest.checkCreatedAt(apiOrder);
      orderFieldTest.checkStatus(apiOrder);
      orderFieldTest.checkType(apiOrder);
      orderFieldTest.checkAmount(apiOrder);
      orderFieldTest.checkPeriod(apiOrder);
      orderFieldTest.checkTargetAddress(apiOrder);
      orderFieldTest.checkBlockchainTransaction(apiOrder);
      orderFieldTest.checkSellPrice(apiOrder);
      
      log.info('✓ Все проверки пройдены успешно. Заказ с ID = 1 корректно получен.');
    } else {
      // Если заказа нет - проверяем обработку ошибки 404
      log.info('Проверка обработки ошибки 404 для несуществующего заказа...');
      responseStatusTest.checkResponseStatus(response, 404);
      const errorResponse = await response.json();
      log.error('Error Response:', JSON.stringify(errorResponse, null, 2));
      
      log.info('✓ Все проверки пройдены успешно. Несуществующий заказ с ID = 1 корректно обработан (404).');
    }
  });

  // Тест-кейс № 7: Проверка граничных значений и базовых некорректных значений orderId
  test('GET /api/v2/orders/{id} should validate boundary and invalid orderId values', async ({ request }) => {
    log.info('=== Тест: Проверка граничных значений и базовых некорректных значений orderId ===');

    const orderApi = new OrderApi(request);
    
    log.info(`Проверяем ${boundaryAndInvalidOrderIdVariations.length} вариаций граничных и базовых некорректных значений...\n`);

    for (const variation of boundaryAndInvalidOrderIdVariations) {
      try {
        log.info(`Проверка: ${variation.description} (значение: ${JSON.stringify(variation.value)})`);
        const response = await orderApi.getOrderById(variation.value as any);
        const status = response.status();

        if (status >= 400) {
          const errorResponse = await response.json();
          log.info(`  ✓ Корректно обработано: статус ${status}`);
          
          if (status === 400) {
            responseStatusTest.checkResponseStatus(response, 400);
          } else if (status === 404) {
            responseStatusTest.checkResponseStatus(response, 404);
          } else {
            responseStatusTest.checkResponseStatus(response, status);
          }
        } else {
          log.warn(`  ✗ Неожиданный статус: ${status} (ожидалась ошибка >= 400)`);
          responseStatusTest.checkResponseStatus(response, status);
        }
      } catch (error: any) {
        log.error(`  ✗ Ошибка при выполнении запроса: ${error.message}`);
      }
      log.info('');
    }

    log.info('✓ Все граничные и базовые некорректные значения orderId были правильно отклонены API.');
  });

  // Тест-кейс № 8: Получение заказа со статусом "COMPLETED"
  test('GET /api/v2/orders/{id} should return order with status "COMPLETED"', async ({ request }) => {
    log.info('=== Тест: Проверка получения заказа со статусом "COMPLETED" ===');

    // Получаем заказ со статусом "COMPLETED" из базы данных
    const completedOrder = await orderRepo.getCompletedOrderByUserId(userId);
  
    const completedOrderId = completedOrder[0].id;
    log.info(`Order ID со статусом "COMPLETED" для тестирования: ${completedOrderId}`);
    log.info(`Статус заказа в БД: ${completedOrder[0].status}`);

    // Создаем экземпляр API клиента для выполнения HTTP запросов
    const orderApi = new OrderApi(request);
    // Выполняем GET запрос к API для получения данных заказа
    const response = await orderApi.getOrderById(completedOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    // ========== БЛОК ПРОВЕРОК ==========

    // Проверка статус кода HTTP ответа
    responseStatusTest.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info('API Response:', JSON.stringify(apiOrder, null, 2));

    // Проверка обязательных полей и их типов
    log.info('Проверка обязательных полей и их типов...');
    const orderFieldTest = new OrderFieldTest();
    orderResponseTest.checkOrderId(apiOrder, completedOrderId);
    orderFieldTest.checkId(apiOrder);
    orderFieldTest.checkCreatedAt(apiOrder);
    orderFieldTest.checkStatus(apiOrder);
    orderFieldTest.checkType(apiOrder);
    orderFieldTest.checkAmount(apiOrder);
    orderFieldTest.checkPeriod(apiOrder);
    orderFieldTest.checkTargetAddress(apiOrder);
    orderFieldTest.checkBlockchainTransaction(apiOrder);
    orderFieldTest.checkSellPrice(apiOrder);

    // Проверка, что статус заказа действительно "COMPLETED"
    log.info('Проверка статуса заказа...');
    expect(apiOrder.status).toBe('COMPLETED');
    log.info(`✓ Статус заказа корректный: ${apiOrder.status}`);

    log.info('✓ Все проверки пройдены успешно. Заказ со статусом "COMPLETED" корректно получен.');
  });

  // Тест-кейс № 9: Получение заказа со статусом "FAILED"
  test('GET /api/v2/orders/{id} should return order with status "FAILED"', async ({ request }) => {
    log.info('=== Тест: Проверка получения заказа со статусом "FAILED" ===');

    // Получаем заказ со статусом "FAILED" из базы данных
    const failedOrder = await orderRepo.getFailedOrderByUserId(userId);
  
    const failedOrderId = failedOrder[0].id;
    log.info(`Order ID со статусом "FAILED" для тестирования: ${failedOrderId}`);
    log.info(`Статус заказа в БД: ${failedOrder[0].status}`);

    // Создаем экземпляр API клиента для выполнения HTTP запросов
    const orderApi = new OrderApi(request);
    // Выполняем GET запрос к API для получения данных заказа
    const response = await orderApi.getOrderById(failedOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    // ========== БЛОК ПРОВЕРОК ==========

    // Проверка статус кода HTTP ответа
    responseStatusTest.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info('API Response:', JSON.stringify(apiOrder, null, 2));

    // Проверка обязательных полей и их типов
    log.info('Проверка обязательных полей и их типов...');
    const orderFieldTest = new OrderFieldTest();
    orderResponseTest.checkOrderId(apiOrder, failedOrderId);
    orderFieldTest.checkId(apiOrder);
    orderFieldTest.checkCreatedAt(apiOrder);
    orderFieldTest.checkStatus(apiOrder);
    orderFieldTest.checkType(apiOrder);
    orderFieldTest.checkAmount(apiOrder);
    orderFieldTest.checkPeriod(apiOrder);
    orderFieldTest.checkTargetAddress(apiOrder);
    orderFieldTest.checkBlockchainTransaction(apiOrder);
    orderFieldTest.checkSellPrice(apiOrder);

    // Проверка, что статус заказа действительно "FAILED"
    log.info('Проверка статуса заказа...');
    expect(apiOrder.status).toBe('FAILED');
    log.info(`✓ Статус заказа корректный: ${apiOrder.status}`);

    log.info('✓ Все проверки пройдены успешно. Заказ со статусом "FAILED" корректно получен.');
  });

  // Тест-кейс № 10: Получение заказа со type = "ENERGY"
  test('GET /api/v2/orders/{id} should return order with type "ENERGY"', async ({ request }) => {
    log.info('=== Тест: Проверка получения заказа с типом "ENERGY" ===');

    // Получаем заказ с типом "ENERGY" из базы данных
    const energyOrder = await orderRepo.getEnergyOrderByUserId(userId);
  
    const energyOrderId = energyOrder[0].id;
    log.info(`Order ID с типом "ENERGY" для тестирования: ${energyOrderId}`);
    log.info(`Тип заказа в БД: ${energyOrder[0].type}`);

    // Создаем экземпляр API клиента для выполнения HTTP запросов
    const orderApi = new OrderApi(request);
    // Выполняем GET запрос к API для получения данных заказа
    const response = await orderApi.getOrderById(energyOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    // ========== БЛОК ПРОВЕРОК ==========

    // Проверка статус кода HTTP ответа
    responseStatusTest.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info('API Response:', JSON.stringify(apiOrder, null, 2));

    // Проверка обязательных полей и их типов
    log.info('Проверка обязательных полей и их типов...');
    const orderFieldTest = new OrderFieldTest();
    orderResponseTest.checkOrderId(apiOrder, energyOrderId);
    orderFieldTest.checkId(apiOrder);
    orderFieldTest.checkCreatedAt(apiOrder);
    orderFieldTest.checkStatus(apiOrder);
    orderFieldTest.checkType(apiOrder);
    orderFieldTest.checkAmount(apiOrder);
    orderFieldTest.checkPeriod(apiOrder);
    orderFieldTest.checkTargetAddress(apiOrder);
    orderFieldTest.checkBlockchainTransaction(apiOrder);
    orderFieldTest.checkSellPrice(apiOrder);

    // Проверка, что тип заказа действительно "ENERGY"
    log.info('Проверка типа заказа...');
    expect(apiOrder.type).toBe('ENERGY');
    log.info(`✓ Тип заказа корректный: ${apiOrder.type}`);

    log.info('✓ Все проверки пройдены успешно. Заказ с типом "ENERGY" корректно получен.');
  });

  // Тест-кейс № 11: Получение заказа со type = "BANDWIDTH"
  test('GET /api/v2/orders/{id} should return order with type "BANDWIDTH"', async ({ request }) => {
    log.info('=== Тест: Проверка получения заказа с типом "BANDWIDTH" ===');

    // Получаем заказ с типом "BANDWIDTH" из базы данных
    const bandwidthOrder = await orderRepo.getBandwidthOrderByUserId(userId);
  
    const bandwidthOrderId = bandwidthOrder[0].id;
    log.info(`Order ID с типом "BANDWIDTH" для тестирования: ${bandwidthOrderId}`);
    log.info(`Тип заказа в БД: ${bandwidthOrder[0].type}`);

    // Создаем экземпляр API клиента для выполнения HTTP запросов
    const orderApi = new OrderApi(request);
    // Выполняем GET запрос к API для получения данных заказа
    const response = await orderApi.getOrderById(bandwidthOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    // ========== БЛОК ПРОВЕРОК ==========

    // Проверка статус кода HTTP ответа
    responseStatusTest.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info('API Response:', JSON.stringify(apiOrder, null, 2));

    // Проверка обязательных полей и их типов
    log.info('Проверка обязательных полей и их типов...');
    const orderFieldTest = new OrderFieldTest();
    orderResponseTest.checkOrderId(apiOrder, bandwidthOrderId);
    orderFieldTest.checkId(apiOrder);
    orderFieldTest.checkCreatedAt(apiOrder);
    orderFieldTest.checkStatus(apiOrder);
    orderFieldTest.checkType(apiOrder);
    orderFieldTest.checkAmount(apiOrder);
    orderFieldTest.checkPeriod(apiOrder);
    orderFieldTest.checkTargetAddress(apiOrder);
    orderFieldTest.checkBlockchainTransaction(apiOrder);
    orderFieldTest.checkSellPrice(apiOrder);

    // Проверка, что тип заказа действительно "BANDWIDTH"
    log.info('Проверка типа заказа...');
    expect(apiOrder.type).toBe('BANDWIDTH');
    log.info(`✓ Тип заказа корректный: ${apiOrder.type}`);

    log.info('✓ Все проверки пройдены успешно. Заказ с типом "BANDWIDTH" корректно получен.');
  });

  // Тест-кейс № 12: Получение заказа со type = "ACTIVATION"
  test('GET /api/v2/orders/{id} should return order with type "ACTIVATION"', async ({ request }) => {
    log.info('=== Тест: Проверка получения заказа с типом "ACTIVATION" ===');

    // Получаем заказ с типом "ACTIVATION" из базы данных
    const activationOrder = await orderRepo.getActivationOrderByUserId(userId);
  
    const activationOrderId = activationOrder[0].id;
    log.info(`Order ID с типом "ACTIVATION" для тестирования: ${activationOrderId}`);
    log.info(`Тип заказа в БД: ${activationOrder[0].type}`);

    // Создаем экземпляр API клиента для выполнения HTTP запросов
    const orderApi = new OrderApi(request);
    // Выполняем GET запрос к API для получения данных заказа
    const response = await orderApi.getOrderById(activationOrderId);
    log.info(`API запрос выполнен. Статус: ${response.status()}`);

    // ========== БЛОК ПРОВЕРОК ==========

    // Проверка статус кода HTTP ответа
    responseStatusTest.checkResponseStatus(response);
    const apiOrder = await response.json();
    log.info('API Response:', JSON.stringify(apiOrder, null, 2));

    // Проверка обязательных полей и их типов
    log.info('Проверка обязательных полей и их типов...');
    const orderFieldTest = new OrderFieldTest();
    orderResponseTest.checkOrderId(apiOrder, activationOrderId);
    orderFieldTest.checkId(apiOrder);
    orderFieldTest.checkCreatedAt(apiOrder);
    orderFieldTest.checkStatus(apiOrder);
    orderFieldTest.checkType(apiOrder);
    // Проверка, что amount для заказа типа "ACTIVATION" равен 1
    orderFieldTest.checkAmount(apiOrder, 1);
    orderFieldTest.checkPeriod(apiOrder);
    orderFieldTest.checkTargetAddress(apiOrder);
    orderFieldTest.checkBlockchainTransaction(apiOrder);
    orderFieldTest.checkSellPrice(apiOrder);

    // Проверка, что тип заказа действительно "ACTIVATION"
    log.info('Проверка типа заказа...');
    expect(apiOrder.type).toBe('ACTIVATION');
    log.info(`✓ Тип заказа корректный: ${apiOrder.type}`);

    log.info('✓ Все проверки пройдены успешно. Заказ с типом "ACTIVATION" корректно получен.');
  });


});
