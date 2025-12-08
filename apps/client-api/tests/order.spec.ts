import { test, expect } from '@playwright/test';
import { OrderRepository } from '../repositories/order.repository';
import { UserRepository } from '../../../shared/repositories/user.repository';
import { coreDb } from '../../../shared/database/connection';

test.describe('Order API', () => {
  const orderRepo = new OrderRepository();
  const userRepo = new UserRepository();

  test('GET /api/v2/orders/{id} should return correct order data', async ({ request }) => {
    const apiKey = process.env.API_KEY;
    const apiUrl = process.env.API_URL;

    if (!apiKey) {
      throw new Error('API_KEY is not defined in environment variables');
    }
    if (!apiUrl) {
        throw new Error('API_URL is not defined in environment variables');
    }

    // 2. Определение пользователя по API ключу
    // Нам нужно знать ID пользователя, чтобы найти именно его заказы в БД
    const userId = await userRepo.findUserIdByApiKey(apiKey);
    if (!userId) {
      throw new Error(`User not found for API Key: ${apiKey}`);
    }

    // 3. Подготовка тестовых данных: Находим ID существующего заказа пользователя в базе данных
    // Мы берем последний созданный заказ, чтобы данные были актуальными
    const existingOrders = await coreDb.$queryRaw<any[]>`
      SELECT id, status, amount FROM "Order" 
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `;

    // Если заказов нет, пропускаем тест (не падаем с ошибкой)
    if (!existingOrders || existingOrders.length === 0) {
      test.skip(true, 'No orders found in database to test');
      return;
    }

    const dbOrder = existingOrders[0];
    const orderId = dbOrder.id;
    console.log(orderId);
    console.log(`Testing API with Order ID: ${orderId}`);

    // 4. Действие: Выполняем запрос к API для получения данных заказа
    // Используем динамический URL и передаем API ключ в заголовках
    const response = await request.get(`${apiUrl}/api/v2/orders/${orderId}`, {
      headers: {
        'X-API-KEY': apiKey
      }
    });

    // 5. Проверки (Assertions)
    
    // Проверяем, что API вернул успешный статус код 200
    if (response.status() === 200) {
      console.log('API returned 200');
    }
    expect(response.status(), `API returned error: ${response.status()} ${response.statusText()}`).toBe(200);

    // Получаем тело ответа в формате JSON
    const apiOrder = await response.json();
    console.log('API Response:', apiOrder);

    // Проверяем, что API вернул данные именно того заказа, который мы запрашивали
    // Приводим оба ID к строке для корректного сравнения (API может возвращать число или строку)
    expect(String(apiOrder.id)).toBe(String(orderId));

    // Дополнительные проверки (зависят от структуры вашего API ответа)
    // Например, если в ответе есть amount:
    // expect(apiOrder.amount).toBe(dbOrder.amount);
  });
});
