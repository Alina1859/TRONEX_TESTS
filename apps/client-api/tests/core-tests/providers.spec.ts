// import { test, expect, APIRequestContext } from "@playwright/test";
// import { ProvidersApi } from "@apps/client-api/api/providers.api";
// import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
// import { log } from "@shared/utils/logger";
// import { HTTP_STATUS_OK, ENERGY_AMOUNT_DEFAULT, OrderPeriod } from "@shared/utils/constants";
// import { CoreRepository } from "@apps/client-api/repositories/core.repository";
// import { OrderApi } from "@apps/client-api/api/order.api";
// import { CreateOrderRequest, Order } from "@shared/utils/types";
// import { userIdPrimary } from "@apps/client-api/api/constants";
// import {
//   createActivatedWallet,
//   waitForActivationCompleted,
//   waitForOrderCompleted,
// } from "@shared/utils/activate-wallets";

// // Тест-кейс № 1. Получение списка провайдеров
// test.describe("Providers API", () => {
//   const responseStatusCheck = new ResponseStatusCheck();

//   test("GET /core/providers/ should return list of providers", async ({ request }) => {
//     log.info("=== Тест: Получение списка провайдеров ===");

//     const providersApi = new ProvidersApi(request);
//     const response = await providersApi.getProvidersList();
//     log.info(`API запрос выполнен. Статус: ${response.status()}`);

//     responseStatusCheck.checkResponseStatus(response, HTTP_STATUS_OK);
//     const providers = await response.json();

//     // Вывод полученного ответа
//     log.info(`Полученный ответ: ${JSON.stringify(providers, null, 2)}`);

//     // Проверка, что ответ является массивом
//     expect(Array.isArray(providers)).toBe(true);
//     log.info(`✓ Получен массив провайдеров. Количество: ${providers.length}`);

//     // Проверка структуры каждого провайдера
//     if (providers.length > 0) {
//       providers.forEach((provider: any, index: number) => {
//         log.info(`Проверка провайдера #${index + 1}: ${provider.name || "unknown"}`);

//         // Проверка обязательного поля name
//         expect(provider).toHaveProperty("name");
//         expect(typeof provider.name).toBe("string");
//         expect(provider.name.length).toBeGreaterThan(0);

//         // Проверка опционального поля link
//         if (provider.link !== undefined) {
//           expect(typeof provider.link).toBe("string");
//         }

//         // Проверка обязательного поля availabilityConfig
//         expect(provider).toHaveProperty("availabilityConfig");
//         expect(typeof provider.availabilityConfig).toBe("object");

//         const availabilityConfig = provider.availabilityConfig;
//         expect(availabilityConfig).toHaveProperty("ENERGY");
//         expect(
//           typeof availabilityConfig.ENERGY === "boolean" ||
//             (Array.isArray(availabilityConfig.ENERGY) &&
//               availabilityConfig.ENERGY.every((item: any) => typeof item === "string"))
//         ).toBe(true);

//         expect(availabilityConfig).toHaveProperty("BANDWIDTH");
//         expect(
//           typeof availabilityConfig.BANDWIDTH === "boolean" ||
//             (Array.isArray(availabilityConfig.BANDWIDTH) &&
//               availabilityConfig.BANDWIDTH.every((item: any) => typeof item === "string"))
//         ).toBe(true);

//         expect(availabilityConfig).toHaveProperty("ACTIVATION");
//         expect(typeof availabilityConfig.ACTIVATION).toBe("boolean");

//         // Проверка поля last1hEnergyPrice
//         expect(provider).toHaveProperty("last1hEnergyPrice");
//         expect(
//           provider.last1hEnergyPrice === null || typeof provider.last1hEnergyPrice === "number"
//         ).toBe(true);

//         log.info(`✓ Провайдер "${provider.name}" прошел все проверки`);
//       });
//     } else {
//       log.info("⚠ Получен пустой массив провайдеров");
//     }

//     log.info("✓ Тест получения списка провайдеров завершен успешно");
//   });

//   // Тест-кейс № 2. Получение баланса провайдеров

//   test("GET /core/providers/:provider/balance should return provider balance", async ({
//     request,
//   }) => {
//     log.info("=== Тест: Получение баланса провайдера ===");

//     const providersApi = new ProvidersApi(request);

//     // Сначала получаем список провайдеров, чтобы узнать доступные имена
//     const providersResponse = await providersApi.getProvidersList();
//     const providers = await providersResponse.json();

//     if (!Array.isArray(providers) || providers.length === 0) {
//       log.warn("⚠ Нет доступных провайдеров для тестирования баланса");
//       return;
//     }

//     // Тестируем баланс для первого провайдера
//     const firstProvider = providers[0];
//     const providerName = firstProvider.name;

//     log.info(`Проверка баланса для провайдера: ${providerName}`);

//     const balanceResponse = await providersApi.getProviderBalance(providerName);
//     log.info(`API запрос выполнен. Статус: ${balanceResponse.status()}`);

//     responseStatusCheck.checkResponseStatus(balanceResponse, HTTP_STATUS_OK);
//     const balance = await balanceResponse.json();

//     // Вывод полученного ответа
//     log.info(`=== Полученный ответ баланса провайдера "${providerName}" ===`);
//     log.info(JSON.stringify(balance, null, 2));
//     log.info(`=== Конец ответа ===`);

//     // Проверка, что баланс является числом
//     expect(typeof balance).toBe("number");
//     expect(balance).toBeGreaterThanOrEqual(0);
//     log.info(`✓ Баланс провайдера "${providerName}": ${balance}`);

//     // Тестируем баланс для несуществующего провайдера (должен вернуть 0)
//     const nonExistentProvider = "non_existent_provider_12345";
//     log.info(`Проверка баланса для несуществующего провайдера: ${nonExistentProvider}`);

//     const nonExistentBalanceResponse = await providersApi.getProviderBalance(nonExistentProvider);
//     log.info(`API запрос выполнен. Статус: ${nonExistentBalanceResponse.status()}`);

//     responseStatusCheck.checkResponseStatus(nonExistentBalanceResponse, HTTP_STATUS_OK);
//     const nonExistentBalance = await nonExistentBalanceResponse.json();

//     // Вывод полученного ответа
//     log.info(`=== Полученный ответ баланса для несуществующего провайдера "${nonExistentProvider}" ===`);
//     log.info(JSON.stringify(nonExistentBalance, null, 2));
//     log.info(`=== Конец ответа ===`);

//     expect(typeof nonExistentBalance).toBe("number");
//     expect(nonExistentBalance).toBe(0);
//     log.info(`✓ Баланс несуществующего провайдера корректно вернул 0`);

//     log.info("✓ Тест получения баланса провайдера завершен успешно");
//   });

//   // Тест-кейс № 3. Смена приоритета провайдера
//   test("should change provider priority and verify provider in DB", async ({ request }) => {
//     test.setTimeout(300000);
//     log.info("=== Тест: Смена приоритета провайдера и проверка в БД ===");

//     const providersApi = new ProvidersApi(request);
//     const coreRepo = new CoreRepository();
//     const orderApi = new OrderApi(request);

//     // Получаем список провайдеров
//     const providersResponse = await providersApi.getProvidersList();
//     responseStatusCheck.checkResponseStatus(providersResponse, HTTP_STATUS_OK);
//     const providers = await providersResponse.json();

//     if (!Array.isArray(providers) || providers.length === 0) {
//       log.warn("⚠ Нет доступных провайдеров для тестирования");
//       return;
//     }

//     // Функция для проверки, поддерживает ли провайдер период 1 час
//     const supportsOneHour = (provider: any): boolean => {
//       const energyConfig = provider.availabilityConfig?.ENERGY;
//       if (energyConfig === true) {
//         return true; // Поддерживает все периоды
//       }
//       if (Array.isArray(energyConfig)) {
//         // Проверяем, есть ли в массиве "1h"
//         return energyConfig.includes("1h");
//       }
//       return false;
//     };

//     // Фильтруем провайдеров, которые поддерживают ENERGY
//     const energyProviders = providers.filter((provider: any) => {
//       const energyConfig = provider.availabilityConfig?.ENERGY;
//       return energyConfig === true || (Array.isArray(energyConfig) && energyConfig.length > 0);
//     });

//     if (energyProviders.length === 0) {
//       log.warn("⚠ Нет провайдеров, поддерживающих ENERGY");
//       return;
//     }

//     // Разделяем провайдеров на тех, кто поддерживает 1 час, и тех, кто не поддерживает
//     const providersSupportingOneHour = energyProviders.filter(supportsOneHour);
//     const providersNotSupportingOneHour = energyProviders.filter(
//       (p) => !supportsOneHour(p)
//     );

//     log.info(`Найдено ${energyProviders.length} провайдеров, поддерживающих ENERGY`);
//     log.info(
//       `  - Поддерживают 1 час: ${providersSupportingOneHour.length} (${providersSupportingOneHour.map((p: any) => p.name).join(", ")})`
//     );
//     log.info(
//       `  - НЕ поддерживают 1 час: ${providersNotSupportingOneHour.length} (${providersNotSupportingOneHour.map((p: any) => p.name).join(", ")})`
//     );

//     if (providersSupportingOneHour.length === 0) {
//       log.warn("⚠ Нет провайдеров, поддерживающих период 1 час");
//       return;
//     }

//     if (providersNotSupportingOneHour.length === 0) {
//       log.warn("⚠ Все провайдеры поддерживают 1 час, тест не может проверить логику выбора по приоритету");
//       return;
//     }

//     // Создаем кошелек и активируем его
//     const { wallet, activationOrder } = await createActivatedWallet(request, responseStatusCheck);
//     const targetAddress = wallet.address?.base58 || "";
    
//     // Ждем завершения активации
//     await waitForActivationCompleted(activationOrder.id, targetAddress, 30000, 1000);

//     // Сохраняем начальные настройки PROVIDER_SETTINGS
//     let initialProviderSettings: any = null;
//     try {
//       const initialSettingsResponse = await coreRepo.coreUsersUserIdSettingsKeyGet(
//         userIdPrimary,
//         "PROVIDER_SETTINGS"
//       );
//       initialProviderSettings = initialSettingsResponse.data;
//       log.info(
//         `Начальные настройки PROVIDER_SETTINGS: ${JSON.stringify(initialProviderSettings)}`
//       );
//     } catch (error) {
//       log.warn(`Не удалось получить начальные настройки PROVIDER_SETTINGS: ${error}`);
//     }

//     // Тестируем: устанавливаем высокий приоритет провайдеру, который НЕ поддерживает 1 час
//     // и более низкие приоритеты провайдерам, которые поддерживают 1 час
//     const highPriorityProvider = providersNotSupportingOneHour[0];
//     const expectedProvider = providersSupportingOneHour[0]; // Ожидаемый провайдер с наивысшим приоритетом среди поддерживающих 1 час

//     log.info(
//       `\n=== Тест: Провайдер ${highPriorityProvider.name} имеет высокий приоритет, но не поддерживает 1 час ===`
//     );
//     log.info(
//       `Ожидаемый провайдер (поддерживает 1 час): ${expectedProvider.name}`
//     );

//     try {
//       // Создаем объект с приоритетами для всех провайдеров
//       const providerSettings: Record<string, { priority: number }> = {};

//       // Провайдеру, который НЕ поддерживает 1 час - самый высокий приоритет (100)
//       providerSettings[highPriorityProvider.name] = {
//         priority: 100,
//       };

//       // Провайдерам, которые поддерживают 1 час - разные приоритеты (60, 40, 20)
//       providersSupportingOneHour.forEach((provider: any, index: number) => {
//         const priorities = [60, 40, 20, 10];
//         providerSettings[provider.name] = {
//           priority: priorities[index] || 10,
//         };
//       });

//       // Остальным провайдерам, которые не поддерживают 1 час - низкие приоритеты
//       providersNotSupportingOneHour.slice(1).forEach((provider: any, index: number) => {
//         providerSettings[provider.name] = {
//           priority: 5 - index,
//         };
//       });

//       // Остальным провайдерам (не ENERGY) - очень низкие приоритеты
//       providers.forEach((provider: any) => {
//         if (!providerSettings[provider.name]) {
//           providerSettings[provider.name] = {
//             priority: 1,
//           };
//         }
//       });

//       log.info(
//         `Установка PROVIDER_SETTINGS: ${JSON.stringify(providerSettings, null, 2)}`
//       );

//       // Устанавливаем приоритеты провайдеров
//       await coreRepo.coreUsersUserIdSettingsKeyPut(userIdPrimary, "PROVIDER_SETTINGS", {
//         value: providerSettings,
//       });

//       // Проверяем, что настройки установлены корректно
//       const verifyResponse = await coreRepo.coreUsersUserIdSettingsKeyGet(
//         userIdPrimary,
//         "PROVIDER_SETTINGS"
//       );
//       const verifyData = verifyResponse.data;
//       log.info(`Проверка PROVIDER_SETTINGS: ${JSON.stringify(verifyData, null, 2)}`);

//       expect(verifyData[highPriorityProvider.name]?.priority).toBe(100);
//       expect(verifyData[expectedProvider.name]?.priority).toBe(60);
//       log.info(`✓ Приоритеты установлены корректно`);

//       // Создаем заказ ENERGY на 1 час
//       const energyRequest: CreateOrderRequest = {
//         type: "ENERGY",
//         targetAddress,
//         amount: ENERGY_AMOUNT_DEFAULT,
//         period: OrderPeriod.ONE_HOUR,
//       };

//       log.info(`Создание заказа ENERGY (1 час): ${JSON.stringify(energyRequest, null, 2)}`);
//       log.info(
//         `Провайдер ${highPriorityProvider.name} имеет приоритет 100, но не поддерживает 1 час (availabilityConfig: ${JSON.stringify(highPriorityProvider.availabilityConfig)})`
//       );
//       log.info(
//         `Ожидается, что будет выбран провайдер ${expectedProvider.name} с приоритетом 60, который поддерживает 1 час`
//       );

//       const orderResponse = await orderApi.createNewOrder(energyRequest);
//       responseStatusCheck.checkResponseStatus(orderResponse);

//       const apiOrder = (await orderResponse.json()) as Order;
//       log.info(`Заказ создан: id=${apiOrder.id}`);

//       // Ждем завершения заказа
//       const dbFinalOrder = await waitForOrderCompleted(apiOrder.id, 90000, 1000);
//       log.info(
//         `Заказ завершен. Проверка провайдера в БД. Order ID: ${apiOrder.id}, Provider в БД: ${dbFinalOrder.provider}`
//       );

//       // Проверяем, что в БД указан провайдер, который поддерживает 1 час, а не тот, у кого самый высокий приоритет
//       expect(dbFinalOrder.provider).not.toBe(highPriorityProvider.name);
//       expect(providersSupportingOneHour.some((p: any) => p.name === dbFinalOrder.provider)).toBe(
//         true
//       );
//       log.info(
//         `✓ Провайдер в БД (${dbFinalOrder.provider}) поддерживает 1 час, а не ${highPriorityProvider.name} с высоким приоритетом`
//       );

//       // Проверяем, что выбран провайдер с наивысшим приоритетом среди поддерживающих 1 час
//       if (dbFinalOrder.provider === expectedProvider.name) {
//         log.info(
//           `✓ Выбран ожидаемый провайдер ${expectedProvider.name} с наивысшим приоритетом среди поддерживающих 1 час`
//         );
//       } else {
//         log.info(
//           `ℹ Выбран провайдер ${dbFinalOrder.provider} (не ${expectedProvider.name}), но он поддерживает 1 час`
//         );
//       }

//       // Дополнительная проверка через API
//       const getOrderResponse = await orderApi.getOrderById(apiOrder.id);
//       responseStatusCheck.checkResponseStatus(getOrderResponse);
//       const apiFinalOrder = (await getOrderResponse.json()) as Order;

//       if (apiFinalOrder.provider) {
//         expect(apiFinalOrder.provider).not.toBe(highPriorityProvider.name);
//         expect(
//           providersSupportingOneHour.some((p: any) => p.name === apiFinalOrder.provider)
//         ).toBe(true);
//         log.info(`✓ Провайдер в API также корректен: ${apiFinalOrder.provider}`);
//       } else {
//         log.warn(`⚠ Провайдер не указан в API ответе, но проверен в БД`);
//       }

//       log.info(`✓ Тест завершен успешно`);
//     } catch (error) {
//       log.error(`Ошибка при тестировании: ${error}`);
//       throw error;
//     }

//     // Восстанавливаем начальные настройки
//     if (initialProviderSettings !== null) {
//       try {
//         await coreRepo.coreUsersUserIdSettingsKeyPut(userIdPrimary, "PROVIDER_SETTINGS", {
//           value: initialProviderSettings,
//         });
//         log.info(`✓ Начальные настройки PROVIDER_SETTINGS восстановлены`);
//       } catch (error) {
//         log.error(`Ошибка при восстановлении начальных настроек: ${error}`);
//       }
//     }

//     log.info("✓ Тест смены приоритета провайдера завершен успешно");
//   });
// });
