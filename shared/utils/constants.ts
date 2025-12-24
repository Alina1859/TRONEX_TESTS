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

export const ORDER_STATUSES = ["INIT", "PENDING", "COMPLETED", "FAILED", "CANCELLED"] as const;

export const ORDER_TYPES = ["ENERGY", "BANDWIDTH", "ACTIVATION"] as const;

export const HTTP_STATUS_OK = 200;
export const HTTP_STATUS_BAD_REQUEST = 400;
export const HTTP_STATUS_NOT_FOUND = 404;
export const HTTP_STATUS_UNSUPPORTED_MEDIA_TYPE = 415;
