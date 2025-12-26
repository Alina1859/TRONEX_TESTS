// import { test, expect } from "@playwright/test";
// import { CoreRepository } from "@apps/client-api/repositories/core.repository";
// import { log } from "@shared/utils/logger";

// test("Create test user without orders and with zero balance", async () => {
//   log.info("=== Создание тестового пользователя без заказов ===");

//   const coreRepo = new CoreRepository();

//   try {
//     const userWithoutOrdersData = {
//       profile: {
//         firstName: "TestUserWithoutOrders",
//         tgId: "123456789",
//         tgUsername: "testuser_without_orders",
//       },
//     };

//     const response = await coreRepo.coreUsersPost(userWithoutOrdersData);

//     const userId = response.data.id;

//     expect(userId).toBeDefined();
//     expect(typeof userId).toBe("string");
//     expect(userId.length).toBeGreaterThan(0);

//     const tokenResponse = await coreRepo.coreUserUserIdAccessTokenGet(userId);
//     const accessToken = tokenResponse.data.token;

//     expect(accessToken).toBeDefined();
//     expect(typeof accessToken).toBe("string");
//     expect(accessToken.length).toBeGreaterThan(0);

//     log.info(`✓ Пользователь успешно создан!`);
//     log.info(`User ID: ${userId}`);
//     log.info(`Access Token: ${accessToken}`);
//     log.info(`Добавьте следующие строки в ваш .env файл:`);
//     log.info(`USER_ID_WITHOUT_ORDERS=${userId}`);
//     log.info(`API_KEY_WITHOUT_ORDERS=${accessToken}`);
//     log.info(`✓ Тестовый пользователь без заказов создан успешно: ${userId}`);
//   } catch (error: any) {
//     log.error(`✗ Ошибка при создании пользователя: ${error.message}`);
//     if (error.response) {
//       log.error(`Response status: ${error.response.status}`);
//       log.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
//     }
//     throw error;
//   }
// });
