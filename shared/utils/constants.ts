export enum OrderPeriod {
  ONE_HOUR = 3600000,
  SIX_HOURS = 21600000,
  ONE_DAY = 86400000,
  THREE_DAYS = 259200000,
  ONE_WEEK = 604800000,
  TWO_WEEKS = 1209600000,
}

export const ENERGY_AMOUNT_MIN = 65000;
export const ENERGY_AMOUNT_MAX = 4000000;
export const ENERGY_AMOUNT_DEFAULT = 65000;
export const ENERGY_ALLOWED_PERIODS = [
  OrderPeriod.ONE_HOUR,
  OrderPeriod.ONE_DAY,
  OrderPeriod.THREE_DAYS,
] as const;

export const BANDWIDTH_AMOUNT_MIN = 1000;
export const BANDWIDTH_AMOUNT_MAX = 2000000;
export const BANDWIDTH_AMOUNT_DEFAULT = 1000;
export const BANDWIDTH_ALLOWED_PERIODS = [OrderPeriod.ONE_HOUR, OrderPeriod.ONE_DAY] as const;

export const VALID_ORDER_PERIODS = [
  OrderPeriod.ONE_HOUR,
  OrderPeriod.SIX_HOURS,
  OrderPeriod.ONE_DAY,
  OrderPeriod.THREE_DAYS,
  OrderPeriod.ONE_WEEK,
  OrderPeriod.TWO_WEEKS,
] as const;

// Allowed lease durations per order type
export const ENERGY_ORDER_PERIODS = [
  OrderPeriod.ONE_HOUR,
  OrderPeriod.ONE_DAY,
  OrderPeriod.THREE_DAYS,
] as const;
export const BANDWIDTH_ORDER_PERIODS = [OrderPeriod.ONE_HOUR, OrderPeriod.ONE_DAY] as const;

export const ORDER_LIST_DEFAULT_OFFSET = 0;
export const ORDER_LIST_MIN_OFFSET = 0;

export const ORDER_LIST_DEFAULT_LIMIT = 10;
export const ORDER_LIST_MIN_LIMIT = 1;
export const ORDER_LIST_MAX_LIMIT = 200;

export const ORDER_ID_MIN = 1;
export const ORDER_ID_MAX = 2147483647;

export const SMART_ORDER_ID_MIN = 1;
export const SMART_ORDER_ID_MAX = 2147483647;

// Price calculation formula
// Formula: ((price * multiplier) / 1_000_000) * amount
// where:
//   price = цена из констант (например, 155.3)
//   multiplier = число из периода (например, "1h" -> 1, "7d" -> 7, "14d" -> 14)
//   amount = значение на которое покупаем (например, 65_000)
// 
// Examples:
//   Для 1 часа: (155.3 * 1 / 1_000_000) * 65_000 = 6.5
//   Для 14 дней: (155.3 * 14 / 1_000_000) * 65_000 = 109.20
export const PRICE_CALCULATION_DIVISOR = 1_000_000;

/**
 * Calculates price based on formula: ((price * multiplier) / 1_000_000) * amount
 * @param price - цена из констант (например, 155.3)
 * @param period - период в формате "1h", "7d", "14d" и т.д.
 * @param amount - значение на которое покупаем (например, 65_000)
 * @returns рассчитанная цена
 */
export function calculatePrice(price: number, period: string, amount: number): number {
  // Извлекаем множитель из периода (например, "1h" -> 1, "7d" -> 7, "14d" -> 14)
  const multiplierMatch = period.match(/^(\d+)/);
  const multiplier = multiplierMatch ? parseInt(multiplierMatch[1], 10) : 1;
  
  // Формула: ((price * multiplier) / 1_000_000) * amount
  return ((price * multiplier) / PRICE_CALCULATION_DIVISOR) * amount;
}
