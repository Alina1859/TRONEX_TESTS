import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Загружаем переменные окружения
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const apiUrl = process.env.API_URL!;
const coreApiToken = process.env.CORE_API_TOKEN!;

if (!apiUrl || !coreApiToken) {
  console.error("Ошибка: API_URL и CORE_API_TOKEN должны быть установлены в .env файле");
  process.exit(1);
}

async function getProvidersList() {
  try {
    const response = await axios.get(`${apiUrl}/core/providers/`, {
      headers: {
        "X-Api-Token": coreApiToken,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Ошибка при получении списка провайдеров:", error.message);
    throw error;
  }
}

async function getProviderBalance(providerName: string) {
  try {
    const response = await axios.get(`${apiUrl}/core/providers/${providerName}/balance`, {
      headers: {
        "X-Api-Token": coreApiToken,
      },
    });
    return response.data;
  } catch (error: any) {
    console.warn(`Не удалось получить баланс для провайдера ${providerName}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("=== Получение информации о провайдерах ===");

  // Получаем список провайдеров
  const providers = await getProvidersList();

  if (!Array.isArray(providers)) {
    console.error("Ответ не является массивом");
    process.exit(1);
  }

  console.log(`Получено ${providers.length} провайдеров`);

  // Получаем баланс для каждого провайдера
  const providersWithInfo = await Promise.all(
    providers.map(async (provider: any) => {
      const balance = await getProviderBalance(provider.name);
      return {
        ...provider,
        balance: typeof balance === "number" ? balance : null,
      };
    })
  );

  // Формируем подробную информацию о провайдерах
  const providersInfo = {
    timestamp: new Date().toISOString(),
    totalProviders: providersWithInfo.length,
    providers: providersWithInfo.map((provider: any) => ({
      name: provider.name,
      link: provider.link || null,
      availabilityConfig: provider.availabilityConfig,
      last1hEnergyPrice: provider.last1hEnergyPrice,
      balance: provider.balance,
      supportsEnergy: {
        all: provider.availabilityConfig?.ENERGY === true,
        periods: Array.isArray(provider.availabilityConfig?.ENERGY)
          ? provider.availabilityConfig.ENERGY
          : provider.availabilityConfig?.ENERGY === true
          ? ["all"]
          : [],
        supports1h:
          provider.availabilityConfig?.ENERGY === true ||
          (Array.isArray(provider.availabilityConfig?.ENERGY) &&
            provider.availabilityConfig.ENERGY.includes("1h")),
        supports1d:
          provider.availabilityConfig?.ENERGY === true ||
          (Array.isArray(provider.availabilityConfig?.ENERGY) &&
            provider.availabilityConfig.ENERGY.includes("1d")),
        supports3d:
          provider.availabilityConfig?.ENERGY === true ||
          (Array.isArray(provider.availabilityConfig?.ENERGY) &&
            provider.availabilityConfig.ENERGY.includes("3d")),
      },
      supportsBandwidth: provider.availabilityConfig?.BANDWIDTH === true,
      supportsActivation: provider.availabilityConfig?.ACTIVATION === true,
    })),
  };

  // Создаем директорию для результатов
  const outputDir = path.join(__dirname, "../test-results");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Сохраняем в JSON файл
  const jsonFileName = `providers-info-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  const jsonFilePath = path.join(outputDir, jsonFileName);
  fs.writeFileSync(jsonFilePath, JSON.stringify(providersInfo, null, 2), "utf-8");
  console.log(`✓ JSON файл сохранен: ${jsonFilePath}`);

  // Создаем читаемый текстовый файл
  const textFileName = `providers-info-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
  const textFilePath = path.join(outputDir, textFileName);

  let textContent = `Информация о провайдерах\n`;
  textContent += `Дата: ${providersInfo.timestamp}\n`;
  textContent += `Всего провайдеров: ${providersInfo.totalProviders}\n\n`;
  textContent += `=== Статистика ===\n`;
  textContent += `Поддерживают ENERGY 1h: ${providersInfo.providers.filter((p) => p.supportsEnergy.supports1h).length}\n`;
  textContent += `Поддерживают ENERGY 1d: ${providersInfo.providers.filter((p) => p.supportsEnergy.supports1d).length}\n`;
  textContent += `Поддерживают ENERGY 3d: ${providersInfo.providers.filter((p) => p.supportsEnergy.supports3d).length}\n`;
  textContent += `Поддерживают BANDWIDTH: ${providersInfo.providers.filter((p) => p.supportsBandwidth).length}\n`;
  textContent += `Поддерживают ACTIVATION: ${providersInfo.providers.filter((p) => p.supportsActivation).length}\n\n`;
  textContent += `=== Детальная информация ===\n\n`;

  providersInfo.providers.forEach((provider, index) => {
    textContent += `${index + 1}. ${provider.name}\n`;
    textContent += `   Ссылка: ${provider.link || "не указана"}\n`;
    textContent += `   Баланс: ${provider.balance !== null ? provider.balance : "не удалось получить"}\n`;
    textContent += `   Цена энергии за последний час: ${provider.last1hEnergyPrice !== null ? provider.last1hEnergyPrice : "не указана"}\n`;
    textContent += `   Поддержка ENERGY:\n`;
    textContent += `     - Все периоды: ${provider.supportsEnergy.all ? "да" : "нет"}\n`;
    textContent += `     - Доступные периоды: ${provider.supportsEnergy.periods.join(", ") || "нет"}\n`;
    textContent += `     - Поддерживает 1h: ${provider.supportsEnergy.supports1h ? "да" : "нет"}\n`;
    textContent += `     - Поддерживает 1d: ${provider.supportsEnergy.supports1d ? "да" : "нет"}\n`;
    textContent += `     - Поддерживает 3d: ${provider.supportsEnergy.supports3d ? "да" : "нет"}\n`;
    textContent += `   Поддержка BANDWIDTH: ${provider.supportsBandwidth ? "да" : "нет"}\n`;
    textContent += `   Поддержка ACTIVATION: ${provider.supportsActivation ? "да" : "нет"}\n`;
    textContent += `   Полная конфигурация:\n`;
    textContent += `     ${JSON.stringify(provider.availabilityConfig, null, 6).split("\n").join("\n     ")}\n`;
    textContent += `\n`;
  });

  fs.writeFileSync(textFilePath, textContent, "utf-8");
  console.log(`✓ Текстовый файл сохранен: ${textFilePath}`);

  console.log(`\n✓ Готово! Информация о ${providersInfo.totalProviders} провайдерах сохранена`);
}

main().catch((error) => {
  console.error("Ошибка:", error);
  process.exit(1);
});

