import { expect, APIResponse } from "@playwright/test";

// Класс для проверки HTTP статус кодов ответов API
export class ResponseStatusTest {
    // Ожидаемый статус код (по умолчанию 200)
    checkResponseStatus(response: APIResponse, expectedStatus: number = 200) {
        if (response.status() === expectedStatus) {
            console.log(`API returned ${expectedStatus}`);
        }
        expect(response.status(), `API returned error: ${response.status()} ${response.statusText()}`).toBe(expectedStatus);
    }

    // Проверяет наличие и значения всех обязательных полей в ответе об ошибке Order not found (404)
    checkNotFoundOrderErrorResponse(errorResponse: any) {
        expect(errorResponse).toHaveProperty('statusCode');
        expect(errorResponse.statusCode).toBe(404);

        expect(errorResponse).toHaveProperty('error');
        expect(errorResponse.error).toBe('Not Found');

        expect(errorResponse).toHaveProperty('message');
        expect(typeof errorResponse.message).toBe('string');
        expect(errorResponse.message.length).toBeGreaterThan(0);
    }

    // Проверяет наличие и значения всех обязательных полей в ответе об ошибке валидации (400)
    checkValidationErrorResponse(errorResponse: any) {
        expect(errorResponse).toHaveProperty('statusCode');
        expect(errorResponse.statusCode).toBe(400);

        expect(errorResponse).toHaveProperty('error');
        expect(errorResponse.error).toBe('Bad Request');

        expect(errorResponse).toHaveProperty('message');
        expect(typeof errorResponse.message).toBe('string');
        expect(errorResponse.message.length).toBeGreaterThan(0);
    }

    // Проверяет наличие и значения всех обязательных полей в ответе об ошибке URI Too Long (414)
    checkUriTooLongErrorResponse(errorResponse: any) {
        expect(errorResponse).toHaveProperty('statusCode');
        expect(errorResponse.statusCode).toBe(414);

        expect(errorResponse).toHaveProperty('error');
        expect(errorResponse.error).toBe('URI Too Long');

        expect(errorResponse).toHaveProperty('message');
        expect(typeof errorResponse.message).toBe('string');
        expect(errorResponse.message.length).toBeGreaterThan(0);
    }
}

