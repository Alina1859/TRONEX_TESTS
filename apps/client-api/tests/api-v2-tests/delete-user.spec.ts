// import { test, expect } from "@playwright/test";
// import { CoreRepository } from "@apps/client-api/repositories/core.repository";
// import { log } from "@shared/utils/logger";

// test("Delete user should successfully remove user", async () => {
//   log.info("=== Тест: Удаление пользователя ===");

//   const userId: string = "";

//   if (!userId || userId.trim() === "") {
//     throw new Error("Не указан ID пользователя для удаления. Укажите userId в тесте.");
//   }

//   expect(userId).toBeDefined();
//   expect(typeof userId).toBe("string");
//   expect(userId.length).toBeGreaterThan(0);
//   log.info(`Удаление пользователя с ID: ${userId}`);

//   const coreRepo = new CoreRepository();

//   try {
//     const tokenResponse = await coreRepo.coreUserUserIdAccessTokenGet(userId);
//     const accessToken = tokenResponse.data.token;

//     expect(accessToken).toBeDefined();
//     expect(typeof accessToken).toBe("string");
//     expect(accessToken.length).toBeGreaterThan(0);
//     log.info(`✅ Токен успешно получен. Пользователь существует.`);

//     log.info(`Удаление пользователя с ID: ${userId}`);
//     const deleteResponse = await coreRepo.coreUsersUserIdDelete(userId);
//     const deleteResult = deleteResponse.data;

//     expect(deleteResult).toBe(true);
//     log.info(`✅ Пользователь успешно удален. Результат: ${deleteResult}`);

//     try {
//       await coreRepo.coreUserUserIdAccessTokenGet(userId);
//       throw new Error("Пользователь не был удален - токен все еще доступен");
//     } catch (error: any) {
//       if (error.response) {
//         const status = error.response.status;
//         log.info(`✅ Попытка получить токен для удаленного пользователя вернула статус: ${status}`);
//         expect(status).toBeGreaterThanOrEqual(400);
//         log.info(`✅ Пользователь успешно удален и больше недоступен`);
//       } else {
//         throw error;
//       }
//     }

//     log.info(`✅ Тест завершен успешно: пользователь удален`);
//   } catch (error: any) {
//     log.error(`✗ Ошибка при выполнении теста: ${error.message}`);
//     if (error.response) {
//       log.error(`Response status: ${error.response.status}`);
//       log.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
//     }
//     throw error;
//   }
// });
