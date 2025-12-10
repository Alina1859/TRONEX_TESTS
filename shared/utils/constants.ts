export enum OrderPeriod {
  ONE_HOUR = 3600000,
  SIX_HOURS = 21600000,
  ONE_DAY = 86400000,
  THREE_DAYS = 259200000,
  ONE_WEEK = 604800000,
  TWO_WEEKS = 1209600000,
}

export const VALID_ORDER_PERIODS = [
  OrderPeriod.ONE_HOUR,
  OrderPeriod.SIX_HOURS,
  OrderPeriod.ONE_DAY,
  OrderPeriod.THREE_DAYS,
  OrderPeriod.ONE_WEEK,
  OrderPeriod.TWO_WEEKS,
] as const;
