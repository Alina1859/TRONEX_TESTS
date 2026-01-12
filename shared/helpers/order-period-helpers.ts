import { OrderPeriod } from "@shared/utils/constants";

export const getPeriodKey = (period: OrderPeriod): "1h" | "1d" | "3d" => {
  if (period === OrderPeriod.ONE_HOUR) return "1h";
  if (period === OrderPeriod.ONE_DAY) return "1d";
  if (period === OrderPeriod.THREE_DAYS) return "3d";
  throw new Error(`Unsupported period: ${period}`);
};

export const getFormulaParams = (period: OrderPeriod): { hour: number; day: number } => {
  if (period === OrderPeriod.ONE_HOUR) return { hour: 1, day: 0 };
  if (period === OrderPeriod.ONE_DAY) return { hour: 24, day: 1 };
  if (period === OrderPeriod.THREE_DAYS) return { hour: 72, day: 3 };
  throw new Error(`Unsupported period: ${period}`);
};

