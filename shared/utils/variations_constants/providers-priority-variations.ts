import { PROVIDER_NAMES } from "@shared/utils/constants";
import { OrderPeriod } from "@shared/utils/constants";
import { ProviderPriorityWithOrderCombination } from "@shared/utils/types";

export const providerTestCases = [
  { providerName: PROVIDER_NAMES.TRON_LOCAL_1, priorityValue: 100 },
  { providerName: PROVIDER_NAMES.TRON_LOCAL_2, priorityValue: 100 },
  { providerName: PROVIDER_NAMES.TRON_LOCAL_3, priorityValue: 100 },
  { providerName: PROVIDER_NAMES.TRON_LOCAL, priorityValue: 100 },
];

export const TEST_ORDER_COMBINATIONS = [
    { duration: "1h", energy: 65000, sunRate: 70, expectedCost: 4.55 },
    { duration: "1d", energy: 65000, sunRate: 210, expectedCost: 13.65 },
    { duration: "3d", energy: 500000, sunRate: 127, expectedCost: 190.5 },
] as const;


export const PROVIDERS_PRIORITY_ENERGY_ORDER_COMBINATIONS = [
  { duration: OrderPeriod.ONE_DAY, amount: 65000, providerName: PROVIDER_NAMES.TRON_LOCAL_1 },
  { duration: OrderPeriod.THREE_DAYS, amount: 100000, providerName: PROVIDER_NAMES.TRON_LOCAL_1 },
  
  { duration: OrderPeriod.ONE_HOUR, amount: 65000, providerName: PROVIDER_NAMES.TRON_LOCAL_2 },
  { duration: OrderPeriod.ONE_DAY, amount: 100000, providerName: PROVIDER_NAMES.TRON_LOCAL_2 },
  { duration: OrderPeriod.THREE_DAYS, amount: 500000, providerName: PROVIDER_NAMES.TRON_LOCAL_2 },
  
  { duration: OrderPeriod.ONE_HOUR, amount: 100000, providerName: PROVIDER_NAMES.TRON_LOCAL_3 },
  { duration: OrderPeriod.ONE_DAY, amount: 500000, providerName: PROVIDER_NAMES.TRON_LOCAL_3 },
  { duration: OrderPeriod.THREE_DAYS, amount: 65000, providerName: PROVIDER_NAMES.TRON_LOCAL_3 },
  
  { duration: OrderPeriod.ONE_HOUR, amount: 500000, providerName: PROVIDER_NAMES.TRON_LOCAL },
  { duration: OrderPeriod.ONE_DAY, amount: 65000, providerName: PROVIDER_NAMES.TRON_LOCAL },
  { duration: OrderPeriod.THREE_DAYS, amount: 100000, providerName: PROVIDER_NAMES.TRON_LOCAL },
] as const;

export const PROVIDER_PRIORITY_WITH_ORDER_COMBINATIONS: ProviderPriorityWithOrderCombination[] = [

  {
    priorityDescription: "TronLocal-1 имеет наивысший приоритет (100), остальные - низкие",
    priorities: { "TronLocal-1": 100, "TronLocal-2": 20, "TronLocal-3": 30, "TronLocal": 40 },
    orderCombination: { duration: "1h", energy: 65000, sunRate: 70, expectedCost: 4.55 },
  },
  {
    priorityDescription: "TronLocal-1 имеет наивысший приоритет (100), остальные - низкие",
    priorities: { "TronLocal-1": 100, "TronLocal-2": 20, "TronLocal-3": 30, "TronLocal": 40 },
    orderCombination: { duration: "1d", energy: 65000, sunRate: 210, expectedCost: 13.65 },
  },
  {
    priorityDescription: "TronLocal-1 имеет наивысший приоритет (100), остальные - низкие",
    priorities: { "TronLocal-1": 100, "TronLocal-2": 20, "TronLocal-3": 30, "TronLocal": 40 },
    orderCombination: { duration: "3d", energy: 500000, sunRate: 127, expectedCost: 190.5 },
  },
  // TronLocal-2 имеет наивысший приоритет (100), остальные - низкие
  {
    priorityDescription: "TronLocal-2 имеет наивысший приоритет (100), остальные - низкие",
    priorities: { "TronLocal-1": 10, "TronLocal-2": 100, "TronLocal-3": 20, "TronLocal": 30 },
    orderCombination: { duration: "1h", energy: 65000, sunRate: 70, expectedCost: 4.55 },
  },
  {
    priorityDescription: "TronLocal-2 имеет наивысший приоритет (100), остальные - низкие",
    priorities: { "TronLocal-1": 10, "TronLocal-2": 100, "TronLocal-3": 20, "TronLocal": 30 },
    orderCombination: { duration: "3d", energy: 500000, sunRate: 127, expectedCost: 190.5 },
  },
  // TronLocal-3 имеет наивысший приоритет (100), остальные - низкие
  {
    priorityDescription: "TronLocal-3 имеет наивысший приоритет (100), остальные - низкие",
    priorities: { "TronLocal-1": 10, "TronLocal-2": 20, "TronLocal-3": 100, "TronLocal": 30 },
    orderCombination: { duration: "1d", energy: 65000, sunRate: 210, expectedCost: 13.65 },
  },
  // TronLocal имеет наивысший приоритет (100), остальные - низкие
  {
    priorityDescription: "TronLocal имеет наивысший приоритет (100), остальные - низкие",
    priorities: { "TronLocal-1": 10, "TronLocal-2": 20, "TronLocal-3": 30, "TronLocal": 100 },
    orderCombination: { duration: "1h", energy: 65000, sunRate: 70, expectedCost: 4.55 },
  },

  // === КОМБИНАЦИИ С РАЗНЫМИ ПРИОРИТЕТАМИ ===
  // Equivalence Partitioning: 1 представитель
  {
    priorityDescription: "Разные приоритеты: TronLocal-2 (100), TronLocal-3 (60), TronLocal (40), TronLocal-1 (20)",
    priorities: { "TronLocal-1": 20, "TronLocal-2": 100, "TronLocal-3": 60, "TronLocal": 40 },
    orderCombination: { duration: "1h", energy: 65000, sunRate: 70, expectedCost: 4.55 },
  },
  {
    priorityDescription: "Разные приоритеты: TronLocal-2 (100), TronLocal-3 (60), TronLocal (40), TronLocal-1 (20)",
    priorities: { "TronLocal-1": 20, "TronLocal-2": 100, "TronLocal-3": 60, "TronLocal": 40 },
    orderCombination: { duration: "3d", energy: 500000, sunRate: 127, expectedCost: 190.5 },
  },

  // === КОМБИНАЦИИ С ДВУМЯ ВЫСОКИМИ ПРИОРИТЕТАМИ ===
  // Equivalence Partitioning: 1 представитель
  {
    priorityDescription: "TronLocal-2 (100) и TronLocal-3 (80) имеют высокие приоритеты",
    priorities: { "TronLocal-1": 10, "TronLocal-2": 100, "TronLocal-3": 80, "TronLocal": 20 },
    orderCombination: { duration: "1d", energy: 65000, sunRate: 210, expectedCost: 13.65 },
  },

  // === КОМБИНАЦИИ С СРЕДНИМИ ПРИОРИТЕТАМИ ===
  // Equivalence Partitioning: 1 представитель
  {
    priorityDescription: "Все провайдеры имеют разные средние приоритеты",
    priorities: { "TronLocal-1": 25, "TronLocal-2": 75, "TronLocal-3": 50, "TronLocal": 100 },
    orderCombination: { duration: "1h", energy: 65000, sunRate: 70, expectedCost: 4.55 },
  },
  {
    priorityDescription: "TronLocal-2 имеет приоритет 60, остальные - ниже",
    priorities: { "TronLocal-1": 10, "TronLocal-2": 60, "TronLocal-3": 20, "TronLocal": 30 },
    orderCombination: { duration: "1d", energy: 65000, sunRate: 210, expectedCost: 13.65 },
  },

  // === КОМБИНАЦИИ С ОДИНАКОВЫМИ ПРИОРИТЕТАМИ ===
  // Boundary Value Analysis: все 3 граничных случая важны
  {
    priorityDescription: "Все провайдеры имеют одинаковый низкий приоритет (10)",
    priorities: { "TronLocal-1": 10, "TronLocal-2": 10, "TronLocal-3": 10, "TronLocal": 10 },
    orderCombination: { duration: "1h", energy: 65000, sunRate: 70, expectedCost: 4.55 },
  },
  {
    priorityDescription: "Все провайдеры имеют одинаковый средний приоритет (50)",
    priorities: { "TronLocal-1": 50, "TronLocal-2": 50, "TronLocal-3": 50, "TronLocal": 50 },
    orderCombination: { duration: "1d", energy: 65000, sunRate: 210, expectedCost: 13.65 },
  },
  {
    priorityDescription: "Все провайдеры имеют одинаковый высокий приоритет (100)",
    priorities: { "TronLocal-1": 100, "TronLocal-2": 100, "TronLocal-3": 100, "TronLocal": 100 },
    orderCombination: { duration: "3d", energy: 500000, sunRate: 127, expectedCost: 190.5 },
  },

  // === КОМБИНАЦИИ С ПОСТЕПЕННЫМ ИЗМЕНЕНИЕМ ===
  // Equivalence Partitioning: 1 представитель (увеличение)
  {
    priorityDescription: "Постепенное увеличение приоритетов: TronLocal-1 (10), TronLocal-2 (30), TronLocal-3 (60), TronLocal (100)",
    priorities: { "TronLocal-1": 10, "TronLocal-2": 30, "TronLocal-3": 60, "TronLocal": 100 },
    orderCombination: { duration: "1h", energy: 65000, sunRate: 70, expectedCost: 4.55 },
  },
  // Equivalence Partitioning: 1 представитель (уменьшение)
  {
    priorityDescription: "Постепенное уменьшение приоритетов: TronLocal-1 (100), TronLocal-2 (60), TronLocal-3 (30), TronLocal (10)",
    priorities: { "TronLocal-1": 100, "TronLocal-2": 60, "TronLocal-3": 30, "TronLocal": 10 },
    orderCombination: { duration: "1d", energy: 65000, sunRate: 210, expectedCost: 13.65 },
  },

  // === КОМБИНАЦИИ С ГРАНИЧНЫМИ ЗНАЧЕНИЯМИ ===
  // Boundary Value Analysis: все граничные случаи важны
  {
    priorityDescription: "Граничные значения: TronLocal-1 (0), TronLocal-2 (1), TronLocal-3 (50), TronLocal (100)",
    priorities: { "TronLocal-1": 0, "TronLocal-2": 1, "TronLocal-3": 50, "TronLocal": 100 },
    orderCombination: { duration: "1h", energy: 65000, sunRate: 70, expectedCost: 4.55 },
  },
  {
    priorityDescription: "Граничные значения: все провайдеры с приоритетом 0",
    priorities: { "TronLocal-1": 0, "TronLocal-2": 0, "TronLocal-3": 0, "TronLocal": 0 },
    orderCombination: { duration: "1d", energy: 65000, sunRate: 210, expectedCost: 13.65 },
  },
  {
    priorityDescription: "Граничные значения: все провайдеры с приоритетом 1",
    priorities: { "TronLocal-1": 1, "TronLocal-2": 1, "TronLocal-3": 1, "TronLocal": 1 },
    orderCombination: { duration: "3d", energy: 500000, sunRate: 127, expectedCost: 190.5 },
  },
  {
    priorityDescription: "Граничные значения: очень большие приоритеты",
    priorities: { "TronLocal-1": 1000, "TronLocal-2": 2000, "TronLocal-3": 3000, "TronLocal": 4000 },
    orderCombination: { duration: "1h", energy: 65000, sunRate: 70, expectedCost: 4.55 },
  },

  // === КОМБИНАЦИИ С ОБРАТНЫМ ПОРЯДКОМ ===
  // Equivalence Partitioning: 1 представитель
  {
    priorityDescription: "Обратный порядок: TronLocal (100), TronLocal-3 (75), TronLocal-2 (50), TronLocal-1 (25)",
    priorities: { "TronLocal-1": 25, "TronLocal-2": 50, "TronLocal-3": 75, "TronLocal": 100 },
    orderCombination: { duration: "1d", energy: 65000, sunRate: 210, expectedCost: 13.65 },
  },

  // === КОМБИНАЦИИ С ПАРАМИ ПРОВАЙДЕРОВ ===
  // Equivalence Partitioning: 1 представитель
  {
    priorityDescription: "Пары: TronLocal-2 и TronLocal-3 высокие (90, 85), остальные низкие",
    priorities: { "TronLocal-1": 10, "TronLocal-2": 90, "TronLocal-3": 85, "TronLocal": 15 },
    orderCombination: { duration: "3d", energy: 500000, sunRate: 127, expectedCost: 190.5 },
  },

  // === КОМБИНАЦИИ С ТРОЙКАМИ ПРОВАЙДЕРОВ ===
  // Equivalence Partitioning: 1 представитель
  {
    priorityDescription: "Тройка: TronLocal-2, TronLocal-3, TronLocal высокие (100, 90, 80), TronLocal-1 низкий",
    priorities: { "TronLocal-1": 10, "TronLocal-2": 100, "TronLocal-3": 90, "TronLocal": 80 },
    orderCombination: { duration: "1h", energy: 65000, sunRate: 70, expectedCost: 4.55 },
  },

  // === СПЕЦИАЛЬНЫЕ КОМБИНАЦИИ ===
  // Boundary Value Analysis: максимальные различия - 1 представитель на провайдера
  {
    priorityDescription: "Специальная: TronLocal-2 максимальный (100), остальные минимальные (1)",
    priorities: { "TronLocal-1": 1, "TronLocal-2": 100, "TronLocal-3": 1, "TronLocal": 1 },
    orderCombination: { duration: "1d", energy: 65000, sunRate: 210, expectedCost: 13.65 },
  },

  // === КОМБИНАЦИИ С РАЗНЫМИ УРОВНЯМИ ===
  // Equivalence Partitioning: 1 представитель (низкие уровни)
  {
    priorityDescription: "Разные уровни: TronLocal-1 (5), TronLocal-2 (15), TronLocal-3 (35), TronLocal (55)",
    priorities: { "TronLocal-1": 5, "TronLocal-2": 15, "TronLocal-3": 35, "TronLocal": 55 },
    orderCombination: { duration: "3d", energy: 500000, sunRate: 127, expectedCost: 190.5 },
  },
  // Equivalence Partitioning: 1 представитель (высокие уровни)
  {
    priorityDescription: "Разные уровни: TronLocal-1 (80), TronLocal-2 (85), TronLocal-3 (90), TronLocal (95)",
    priorities: { "TronLocal-1": 80, "TronLocal-2": 85, "TronLocal-3": 90, "TronLocal": 95 },
    orderCombination: { duration: "1h", energy: 65000, sunRate: 70, expectedCost: 4.55 },
  },
];
