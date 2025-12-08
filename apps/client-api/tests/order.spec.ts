import { test, expect } from '@playwright/test';
import { UserRepository } from '../repositories/user.repository';
import { OrderRepository } from '../repositories/order.repository';
import { coreDb } from '../../../shared/database/connection';
import { OrderApi } from '../api/order.api';
import { OrderResponseTest } from '../TestObjects/OrderResponseTest';
import { OrderFieldTest } from '../TestObjects/OrderFieldTest';
import { ResponseStatusTest } from '../TestObjects/ResponseStatusTest';
import { 
  boundaryAndInvalidOrderIdVariations, 
  securityAttackOrderIdVariations 
} from '../TestObjects/InvalidOrderIdVariations';


// Тестирует корректность работы эндпоинта GET /api/v2/orders/{id}

test.describe('Order API', () => {
  const orderRepo = new OrderRepository();
  const userId = process.env.USER_ID_PRIMARY!;
  const otherUserId = process.env.USER_ID_SECONDARY!;
  const responseStatusTest = new ResponseStatusTest();
  const orderResponseTest = new OrderResponseTest();

  // Тест-кейс № 3: Проверка валидности полей ответа API для пользователя с заказами
  test('GET /api/v2/orders/{id} should return correct order data', async ({ request }) => {
    console.log('=== Тест: Проверка валидности полей ответа API ===');
    
    // Инициализация классов для проверки ответов и полей заказа
    const orderFieldTest = new OrderFieldTest();

    // Получаем последний заказ пользователя из базы данных
    const getLastOrderByUserId = await orderRepo.getLastOrderByUserId(userId);
    // Извлекаем ID последнего заказа для тестирования
    const lastOrderId = getLastOrderByUserId[0].id;
    console.log(`Order ID для тестирования: ${lastOrderId}`);

    // Создаем экземпляр API клиента для выполнения HTTP запросов
    const orderApi = new OrderApi(request);
    // Выполняем GET запрос к API для получения данных заказа по его ID
    const response = await orderApi.getOrderById(lastOrderId);
    console.log(`API запрос выполнен. Статус: ${response.status()}`);

    // ========== БЛОК ПРОВЕРОК ==========
    
    // Проверка статус кода HTTP ответа
    responseStatusTest.checkResponseStatus(response);
    const apiOrder = await response.json();
    console.log('API Response:', JSON.stringify(apiOrder, null, 2));

    // Проверка обязательных полей и их типов
    console.log('Проверка обязательных полей и их типов...');
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

    console.log('✓ Все проверки пройдены успешно');
  });

  // Тест-кейс № 4: Получение чужого заказа по orderId
  test('GET /api/v2/orders/{id} should not return order from another user', async ({ request }) => {
    console.log('=== Тест: Проверка безопасности доступа к заказам ===');

    // Получаем последний заказ другого пользователя из базы данных
    const getLastOrderByUserId = await orderRepo.getLastOrderByUserId(otherUserId);
    // Извлекаем ID последнего заказа для тестирования
    console.log('Последний заказ другого пользователя:', JSON.stringify(getLastOrderByUserId, null, 2));
    const lastOrderId = getLastOrderByUserId[0].id;
    console.log(`Попытка доступа к Order ID: ${lastOrderId} (принадлежит другому пользователю)`);

    // Создаем экземпляр API клиента для выполнения HTTP запросов
    const orderApi = new OrderApi(request);
    // Выполняем GET запрос к API для получения данных заказа по его ID
    const response = await orderApi.getOrderById(lastOrderId);
    console.log(`API запрос выполнен. Статус: ${response.status()}`);

    // ========== БЛОК ПРОВЕРОК ==========

    // Проверяем, что API вернул статус 404 Not Found
    responseStatusTest.checkResponseStatus(response, 404);
    const errorResponse = await response.json();
    console.log('Error Response:', JSON.stringify(errorResponse, null, 2));
    
    // Проверяем структуру ответа об ошибке 404 Not Found
    console.log('Проверка структуры ответа об ошибке...');
    responseStatusTest.checkNotFoundOrderErrorResponse(errorResponse);
    
    console.log('✓ Все проверки пройдены успешно. Доступ к чужому заказу заблокирован.');
  });

  // Тест-кейс № 5: Получение несуществующего заказа по orderId
  test('GET /api/v2/orders/{id} should return 404 for non-existent order', async ({ request }) => {
    console.log('=== Тест: Проверка обработки несуществующего заказа ===');

    // Получаем максимальный ID заказа из базы данных
    const maxOrderId = await orderRepo.getMaxOrderId();
    console.log(`Максимальный ID заказа в БД: ${maxOrderId}`);
    
    // Генерируем несуществующий ID заказа (максимальный ID + 10)
    const nonExistentOrderId = maxOrderId + 10;
    console.log(`Сгенерированный несуществующий Order ID: ${nonExistentOrderId}`);

    // Создаем экземпляр API клиента для выполнения HTTP запросов
    const orderApi = new OrderApi(request);
    // Выполняем GET запрос к API для получения данных несуществующего заказа
    const response = await orderApi.getOrderById(nonExistentOrderId);
    console.log(`API запрос выполнен. Статус: ${response.status()}`);

    // ========== БЛОК ПРОВЕРОК ==========

    // Проверяем, что API вернул статус 404 Not Found
    responseStatusTest.checkResponseStatus(response, 404);
    const errorResponse = await response.json();
    console.log('Error Response:', JSON.stringify(errorResponse, null, 2));
    
    // Проверяем структуру ответа об ошибке 404 Not Found
    console.log('Проверка структуры ответа об ошибке...');
    responseStatusTest.checkNotFoundOrderErrorResponse(errorResponse);
    
    console.log('✓ Все проверки пройдены успешно. Несуществующий заказ корректно обработан (404).');
  });

  // Тест-кейс № 6: Получение заказа по orderId = 1 (существующий или несуществующий)
  test('GET /api/v2/orders/{id} should return order or 404 for order with id = 1', async ({ request }) => {
    console.log('=== Тест: Проверка обработки заказа с ID = 1 ===');

    // Используем ID = 1 для проверки
    const orderId = 1;
    console.log(`Проверяемый Order ID: ${orderId}`);

    // Проверяем в базе данных, существует ли такой заказ
    const orderInDb = await orderRepo.getOrderById(orderId);
    console.log('Проверка в БД:', JSON.stringify(orderInDb, null, 2));
    
    const orderExists = orderInDb && orderInDb.length > 0;
    
    if (orderExists) {
      console.log(`✓ Заказ с ID ${orderId} существует в БД. Проверяем корректность ответа API.`);
    } else {
      console.log(`✓ Заказ с ID ${orderId} не существует в БД. Проверяем обработку ошибки 404.`);
    }

    // Создаем экземпляр API клиента для выполнения HTTP запросов
    const orderApi = new OrderApi(request);
    // Выполняем GET запрос к API для получения данных заказа
    const response = await orderApi.getOrderById(orderId);
    console.log(`API запрос выполнен. Статус: ${response.status()}`);

    // ========== БЛОК ПРОВЕРОК ==========

    if (orderExists) {
      // Если заказ существует - проверяем корректность ответа
      console.log('Проверка корректности ответа для существующего заказа...');
      responseStatusTest.checkResponseStatus(response);
      const apiOrder = await response.json();
      console.log('API Response:', JSON.stringify(apiOrder, null, 2));

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
      
      console.log('✓ Все проверки пройдены успешно. Заказ с ID = 1 корректно получен.');
    } else {
      // Если заказа нет - проверяем обработку ошибки 404
      console.log('Проверка обработки ошибки 404 для несуществующего заказа...');
      responseStatusTest.checkResponseStatus(response, 404);
      const errorResponse = await response.json();
      console.log('Error Response:', JSON.stringify(errorResponse, null, 2));
      
      // Проверяем структуру ответа об ошибке 404 Not Found
      console.log('Проверка структуры ответа об ошибке...');
      responseStatusTest.checkNotFoundOrderErrorResponse(errorResponse);
      
      console.log('✓ Все проверки пройдены успешно. Несуществующий заказ с ID = 1 корректно обработан (404).');
    }
  });

  // Вспомогательная функция для проверки вариаций orderId
  async function testOrderIdVariations(
    variations: Array<{ value: any; description: string }>,
    testName: string,
    orderApi: OrderApi
  ) {
    const results = [];

    console.log(`Проверяем ${variations.length} вариаций ${testName}...\n`);

    for (const variation of variations) {
      try {
        console.log(`Проверка: ${variation.description} (значение: ${JSON.stringify(variation.value)})`);
        
        // Выполняем GET запрос к API
        const response = await orderApi.getOrderById(variation.value as any);
        const status = response.status();
        
        // Проверяем, что API вернул ошибку (400 Bad Request или 404 Not Found)
        const isValidError = status === 400 || status === 404;
        
        const result: any = {
          variation: variation.description,
          value: variation.value,
          status: status,
          isValid: isValidError,
        };

        if (isValidError) {
          const errorResponse = await response.json();
          result.errorResponse = errorResponse;
          console.log(`  ✓ Корректно обработано: статус ${status}`);
          
          // Проверяем структуру ответа об ошибке в зависимости от статуса
          if (status === 400) {
            console.log(`  Проверка структуры ответа об ошибке валидации (400)...`);
            responseStatusTest.checkValidationErrorResponse(errorResponse);
          } else if (status === 404) {
            console.log(`  Проверка структуры ответа об ошибке (404)...`);
            responseStatusTest.checkNotFoundOrderErrorResponse(errorResponse);
          }
        } else {
          console.log(`  ✗ Неожиданный статус: ${status} (ожидался 400 или 404)`);
        }

        results.push(result);
      } catch (error: any) {
        console.log(`  ✗ Ошибка при выполнении запроса: ${error.message}`);
        results.push({
          variation: variation.description,
          value: variation.value,
          error: error.message,
          isValid: false,
        });
      }
      console.log('');
    }

    // Выводим итоговый отчет
    console.log('=== ИТОГОВЫЙ ОТЧЕТ ===');
    const validResults = results.filter(r => r.isValid);
    const invalidResults = results.filter(r => !r.isValid);
    
    console.log(`Корректно обработано: ${validResults.length}/${results.length}`);
    console.log(`Некорректно обработано: ${invalidResults.length}/${results.length}\n`);

    if (invalidResults.length > 0) {
      console.log('Некорректно обработанные вариации:');
      invalidResults.forEach(r => {
        console.log(`  - ${r.variation} (значение: ${JSON.stringify(r.value)})`);
      });
    }

    // Проверяем, что все некорректные значения были отклонены
    expect(invalidResults.length).toBe(0);
    
    return results;
  }

  // Тест-кейс № 7: Проверка граничных значений и базовых некорректных значений orderId
  test('GET /api/v2/orders/{id} should validate boundary and invalid orderId values', async ({ request }) => {
    console.log('=== Тест: Проверка граничных значений и базовых некорректных значений orderId ===');

    const orderApi = new OrderApi(request);
    await testOrderIdVariations(
      boundaryAndInvalidOrderIdVariations,
      'граничных и базовых некорректных значений',
      orderApi
    );
    
    console.log('✓ Все граничные и базовые некорректные значения orderId были правильно отклонены API.');
  });

  // Тест-кейс № 8: Проверка безопасности orderId (SQL-инъекции, XSS и другие атаки)
  test('GET /api/v2/orders/{id} should prevent security attacks on orderId', async ({ request }) => {
    console.log('=== Тест: Проверка безопасности orderId (SQL-инъекции, XSS и другие атаки) ===');

    const orderApi = new OrderApi(request);
    await testOrderIdVariations(
      securityAttackOrderIdVariations,
      'техник атак безопасности',
      orderApi
    );
    
    console.log('✓ Все техники атак безопасности были правильно отклонены API.');
  });

});
