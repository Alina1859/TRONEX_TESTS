import { OrderPeriod } from "@shared/utils/constants";

/**
 * Конвертирует enum OrderPeriod в строковый ключ для доступа к данным цен
 * @param period - период заказа в миллисекундах (OrderPeriod enum)
 * @returns строковый ключ "1h", "1d" или "3d"
 * @throws Error если период не поддерживается
 */
export const getPeriodKey = (period: OrderPeriod): "1h" | "1d" | "3d" => {
  if (period === OrderPeriod.ONE_HOUR) return "1h";
  if (period === OrderPeriod.ONE_DAY) return "1d";
  if (period === OrderPeriod.THREE_DAYS) return "3d";
  throw new Error(`Unsupported period: ${period}`);
};

/**
 * Возвращает параметры для расчета цены по формуле ENERGY_PRICE_FORMULA
 * @param period - период заказа в миллисекундах (OrderPeriod enum)
 * @returns объект с параметрами { hour: number, day: number }
 * @throws Error если период не поддерживается
 */
export const getFormulaParams = (period: OrderPeriod): { hour: number; day: number } => {
  if (period === OrderPeriod.ONE_HOUR) return { hour: 1, day: 0 };
  if (period === OrderPeriod.ONE_DAY) return { hour: 24, day: 1 };
  if (period === OrderPeriod.THREE_DAYS) return { hour: 72, day: 3 };
  throw new Error(`Unsupported period: ${period}`);
};

