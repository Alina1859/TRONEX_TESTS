import { OrderPeriod } from "@shared/utils/constants";

export const DYNAMIC_PRICE_ORDER_COMBINATIONS_1H = [
  { duration: OrderPeriod.ONE_HOUR, amount: 65000 },
  { duration: OrderPeriod.ONE_HOUR, amount: 100000 },
  { duration: OrderPeriod.ONE_HOUR, amount: 500000 },
] as const;

export const DYNAMIC_PRICE_ORDER_COMBINATIONS_LONG = [
  { duration: OrderPeriod.ONE_DAY, amount: 65000 },
  { duration: OrderPeriod.ONE_DAY, amount: 100000 },
  { duration: OrderPeriod.ONE_DAY, amount: 500000 },

  { duration: OrderPeriod.THREE_DAYS, amount: 65000 },
  { duration: OrderPeriod.THREE_DAYS, amount: 100000 },
  { duration: OrderPeriod.THREE_DAYS, amount: 500000 },
] as const;

