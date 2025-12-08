import { expect } from "@playwright/test";

// Класс для проверки HTTP ответов API заказов
// Содержит методы для проверки базовых свойств ответа

export class OrderResponseTest {
    // Убеждаемся, что API вернул данные именно того заказа, который мы запрашивали
    checkOrderId(apiOrder: any, expectedOrderId: string | number) {
        expect(String(apiOrder.id)).toBe(String(expectedOrderId));
    }
}

