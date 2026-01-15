import { test } from "@playwright/test";
import { CoreRepository } from "@apps/client-api/api/core.api";
import { log } from "@shared/utils/logger";
import { EnergyPriceValues } from "@shared/utils/types";
import { PROVIDER_NAMES, PROVIDER_ENERGY_PRICES } from "@shared/utils/constants";

export const clearProviderSettings = async (coreRepo: CoreRepository, userId: string) => {
  await test.step("Удалить все настройки провайдеров", async () => {
    try {
      await coreRepo.coreUsersUserIdSettingsKeyPut({
        userId: userId,
        key: "PROVIDER_SETTINGS",
        coreUsersUserIdSettingsKeyPutRequest: {
          value: null,
        },
      });
      log.info(`✓ Все настройки провайдеров удалены (value: null)`);
    } catch (error) {
      log.error(`Ошибка при удалении настроек провайдеров: ${error}`);
      throw error;
    }
  });
};

export const getEnergyPrice = async (
  coreRepo: CoreRepository,
  userId: string,
  periodKey: keyof EnergyPriceValues
) => {
  try {
    const userPriceEnergyResponse = await coreRepo.coreUsersUserIdSettingsKeyGet({
      userId: userId,
      key: "PRICE_ENERGY",
    });
    if (userPriceEnergyResponse.data) {
      const userPrice = (userPriceEnergyResponse.data as EnergyPriceValues)[periodKey];
      if (typeof userPrice === "number" && Number.isFinite(userPrice)) {
        return userPrice;
      }
      if (userPrice !== undefined) {
        log.error(
          `Некорректная пользовательская цена энергии: period=${periodKey}, value=${userPrice}, data=${JSON.stringify(
            userPriceEnergyResponse.data,
            null,
            2
          )}`
        );
      }
    }
  } catch (error) {
    log.error(`Ошибка при получении пользовательской цены энергии: ${error}`);
  }

  const globalPriceEnergyResponse = await coreRepo.coreConstantsKeyGet({
    key: "PRICE_ENERGY",
  });
  const globalPrice = (globalPriceEnergyResponse.data as EnergyPriceValues)[periodKey];
  if (typeof globalPrice === "number" && Number.isFinite(globalPrice)) {
    return globalPrice;
  }

  throw new Error(
    `Некорректная глобальная цена энергии: period=${periodKey}, value=${globalPrice}, data=${JSON.stringify(
      globalPriceEnergyResponse.data,
      null,
      2
    )}`
  );
};

export const getProviderEnergyPrice = (providerName: string): number => {
  const providerKey = Object.entries(PROVIDER_NAMES).find(
    ([_, name]) => name === providerName
  )?.[0] as keyof typeof PROVIDER_ENERGY_PRICES | undefined;

  if (!providerKey || !(providerKey in PROVIDER_ENERGY_PRICES)) {
    throw new Error(
      `Провайдер "${providerName}" не найден в PROVIDER_ENERGY_PRICES. Доступные провайдеры: ${Object.values(PROVIDER_NAMES).join(", ")}`
    );
  }

  const price = PROVIDER_ENERGY_PRICES[providerKey];
  if (typeof price !== "number" || !Number.isFinite(price)) {
    throw new Error(
      `Некорректная цена для провайдера "${providerName}": ${price}`
    );
  }

  return price;
};

