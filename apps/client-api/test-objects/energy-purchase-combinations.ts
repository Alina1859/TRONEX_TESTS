/**
 * Комбинации для тестирования покупки энергии
 * Каждая комбинация содержит: длительность периода, количество энергии, курс SUN и ожидаемую стоимость в TRX
 */
export interface EnergyPurchaseCombination {
  /** Длительность периода в формате "1h", "1d", "3d" */
  duration: "1h" | "1d" | "3d";
  /** Количество энергии */
  energy: number;
  /** Курс SUN (цена энергии) */
  sunRate: number;
  /** Ожидаемая стоимость в TRX */
  expectedCost: number;
}

/**
 * Все комбинации для тестирования покупки энергии
 */
export const ENERGY_PURCHASE_COMBINATIONS: EnergyPurchaseCombination[] = [
  // 1 час
  { duration: "1h", energy: 65000, sunRate: 30, expectedCost: 1.95 },
  { duration: "1h", energy: 65000, sunRate: 155.3, expectedCost: 10.0945 },
  { duration: "1h", energy: 65000, sunRate: 75, expectedCost: 4.875 },
  { duration: "1h", energy: 500000, sunRate: 30, expectedCost: 15 },
  { duration: "1h", energy: 500000, sunRate: 155.3, expectedCost: 77.65 },
  { duration: "1h", energy: 500000, sunRate: 75, expectedCost: 37.5 },
  // { duration: "1h", energy: 1000000, sunRate: 30, expectedCost: 30 },
  // { duration: "1h", energy: 1000000, sunRate: 155.3, expectedCost: 155.3 },
  // { duration: "1h", energy: 1000000, sunRate: 75, expectedCost: 75 },

  // 1 день
  { duration: "1d", energy: 65000, sunRate: 30, expectedCost: 1.95 },
  { duration: "1d", energy: 65000, sunRate: 155.3, expectedCost: 10.0945 },
  { duration: "1d", energy: 65000, sunRate: 75, expectedCost: 4.875 },
  { duration: "1d", energy: 500000, sunRate: 30, expectedCost: 15 },
  { duration: "1d", energy: 500000, sunRate: 155.3, expectedCost: 77.65 },
  { duration: "1d", energy: 500000, sunRate: 75, expectedCost: 37.5 },
  // { duration: "1d", energy: 1000000, sunRate: 30, expectedCost: 30 },
  // { duration: "1d", energy: 1000000, sunRate: 155.3, expectedCost: 155.3 },
  // { duration: "1d", energy: 1000000, sunRate: 75, expectedCost: 75 },

  // 3 дня
  { duration: "3d", energy: 65000, sunRate: 30, expectedCost: 5.85 },
  { duration: "3d", energy: 65000, sunRate: 155.3, expectedCost: 30.2835 },
  { duration: "3d", energy: 65000, sunRate: 75, expectedCost: 14.625 },
  { duration: "3d", energy: 500000, sunRate: 30, expectedCost: 45 },
  { duration: "3d", energy: 500000, sunRate: 155.3, expectedCost: 232.95 },
  { duration: "3d", energy: 500000, sunRate: 75, expectedCost: 112.5 },
  // { duration: "3d", energy: 1000000, sunRate: 30, expectedCost: 90 },
  // { duration: "3d", energy: 1000000, sunRate: 155.3, expectedCost: 465.9 },
  // { duration: "3d", energy: 1000000, sunRate: 75, expectedCost: 225 },
];
