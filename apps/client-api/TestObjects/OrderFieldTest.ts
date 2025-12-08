import { expect } from "@playwright/test";

// Класс для проверки полей объекта заказа
// Содержит методы для валидации структуры и типов данных полей заказа
export class OrderFieldTest {

    // Проверка поля id: должно быть числом (number), обязательное поле
    checkId(apiOrder: any) {
        expect(apiOrder).toHaveProperty('id');
        expect(typeof apiOrder.id).toBe('number');
    }

    // Проверка поля createdAt: должно быть строкой в формате ISO 8601 (date-time), обязательное поле
    checkCreatedAt(apiOrder: any) {
        expect(apiOrder).toHaveProperty('createdAt');
        expect(typeof apiOrder.createdAt).toBe('string');
        expect(() => new Date(apiOrder.createdAt)).not.toThrow();
        expect(isNaN(new Date(apiOrder.createdAt).getTime())).toBe(false);
    }


    //  Проверка поля status: должно быть строкой из списка допустимых значений (enum), обязательное поле
    //  Статус заказа может быть одним из: INIT, PENDING, COMPLETED, FAILED, CANCELLED
    checkStatus(apiOrder: any) {
        expect(apiOrder).toHaveProperty('status');
        expect(typeof apiOrder.status).toBe('string');
        expect(['INIT', 'PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).toContain(apiOrder.status);
    }

    // Проверка поля type: должно быть строкой из списка допустимых значений (enum), обязательное поле
    // Тип заказа может быть одним из: ENERGY, BANDWIDTH, ACTIVATION
    checkType(apiOrder: any) {
        expect(apiOrder).toHaveProperty('type');
        expect(typeof apiOrder.type).toBe('string');
        expect(['ENERGY', 'BANDWIDTH', 'ACTIVATION']).toContain(apiOrder.type);
    }

    // Проверка поля amount: должно быть числом (number), обязательное поле
    checkAmount(apiOrder: any) {
        expect(apiOrder).toHaveProperty('amount');
        expect(typeof apiOrder.amount).toBe('number');
    }

    // Период действия заказа в миллисекундах (может быть null для некоторых типов заказов)
    checkPeriod(apiOrder: any) {
        expect(apiOrder).toHaveProperty('period');
        
        const period = apiOrder.period;
        if (period !== null) {
            expect(typeof period).toBe('number');
            const validPeriods = [3600000, 21600000, 86400000, 259200000, 604800000, 1209600000];
            expect(validPeriods).toContain(period);
        } else {
            expect(period).toBeNull();
        }
    }

    // Проверка поля targetAddress: должно быть непустой строкой, обязательное поле
    checkTargetAddress(apiOrder: any) {
        expect(apiOrder).toHaveProperty('targetAddress');
        expect(typeof apiOrder.targetAddress).toBe('string');
        expect(apiOrder.targetAddress.length).toBeGreaterThan(0);
    }

    // Проверка поля blockchainTransaction: может быть строкой или null, обязательное поле
    checkBlockchainTransaction(apiOrder: any) {
        expect(apiOrder).toHaveProperty('blockchainTransaction');
        if (apiOrder.blockchainTransaction !== null) {
            expect(typeof apiOrder.blockchainTransaction).toBe('string');
        } else {
            expect(apiOrder.blockchainTransaction).toBeNull();
        }
    }

    // Проверка поля sellPrice: должно быть числом (number), обязательное поле
    checkSellPrice(apiOrder: any) {
        expect(apiOrder).toHaveProperty('sellPrice');
        expect(typeof apiOrder.sellPrice).toBe('number');
    }
}

