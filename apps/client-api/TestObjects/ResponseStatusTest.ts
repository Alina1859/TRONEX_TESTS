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

    checkNotFoundOrderErrorResponse(errorResponse: any) {
        expect(errorResponse).toHaveProperty('statusCode');
        expect(errorResponse.statusCode).toBe(404);
    }

    checkValidationErrorResponse(errorResponse: any) {
        expect(errorResponse).toHaveProperty('statusCode');
        expect(errorResponse.statusCode).toBe(400);
    }

    checkUriTooLongErrorResponse(errorResponse: any) {
        expect(errorResponse).toHaveProperty('statusCode');
        expect(errorResponse.statusCode).toBe(414);
    }
}

