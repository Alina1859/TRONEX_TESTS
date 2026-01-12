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

export enum OrderStatus {
  INIT = "INIT",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum OrderType {
  ENERGY = "ENERGY",
  BANDWIDTH = "BANDWIDTH",
  ACTIVATION = "ACTIVATION",
}

export enum HttpStatus {
  OK = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  UNSUPPORTED_MEDIA_TYPE = 415,
  TOO_MANY_REQUESTS = 429,
}

export enum SmartOrderStatus {
  INIT = "INIT",
  PENDING_ACTIVATION = "PENDING_ACTIVATION",
  PENDING_RESOURCES = "PENDING_RESOURCES",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum OrderSource {
  BOT = "BOT",
  API = "API",
  WEB = "WEB",
  AUTO_REFILL = "AUTO_REFILL",
  SMART_REFILL = "SMART_REFILL",
}

export const ENERGY_PRICE_FORMULA = (sunRate: number, hour: number, day: number, energyAmount: number) => {
  const durationMultiplier = day > 0 ? day : hour;
  return ((sunRate * durationMultiplier) / 1000000) * energyAmount;
}

export const ENERGY_PRICE_FORMULA_DYNAMIC = (minSunRate: number, hour: number, day: number, energyAmount: number, dynamicPriceOffset: number) => {
  const durationMultiplier = day > 0 ? day : hour;
  return (energyAmount * (minSunRate + dynamicPriceOffset) * durationMultiplier) / 1000000;
}


export const BANDWIDTH_PRICE_FORMULA = (sunRate: number, hour: number, day: number, bandwidthAmount: number) => {
  const durationMultiplier = day > 0 ? day : hour;
  return ((sunRate * durationMultiplier  + 295) / 1000000) * bandwidthAmount;
}

export const PROVIDER_TEST_PRIORITY = 100;

export const PROVIDER_NAMES = {
  TRON_LOCAL_1: "TronLocal-1",
  TRON_LOCAL_2: "TronLocal-2",
  TRON_LOCAL_3: "TronLocal-3",
  TRON_LOCAL: "TronLocal",
} as const;

export const PROVIDER_ENERGY_PRICES = {
  TRON_LOCAL_1: 48,
  TRON_LOCAL_2: 53.08,
  TRON_LOCAL_3: 58,
  TRON_LOCAL: 43.08,
} as const;

export const PROVIDER_AVAILABILITY_CONFIG = {
  TRON_LOCAL_1: {
    ENERGY: ["1d", "3d"],
    BANDWIDTH: false,
    ACTIVATION: false,
  },
  TRON_LOCAL_2: {
    ENERGY: true,
    BANDWIDTH: true,
    ACTIVATION: true,
  },
  TRON_LOCAL_3: {
    ENERGY: true,
    BANDWIDTH: true,
    ACTIVATION: true,
  },
  TRON_LOCAL: {
    ENERGY: true,
    BANDWIDTH: true,
    ACTIVATION: true,
  },
} as const;

export const PROVIDERS = [
  {
    name: PROVIDER_NAMES.TRON_LOCAL_1,
    availabilityConfig: {
      ENERGY: [...PROVIDER_AVAILABILITY_CONFIG.TRON_LOCAL_1.ENERGY],
      BANDWIDTH: PROVIDER_AVAILABILITY_CONFIG.TRON_LOCAL_1.BANDWIDTH,
      ACTIVATION: PROVIDER_AVAILABILITY_CONFIG.TRON_LOCAL_1.ACTIVATION,
    },
  },
  {
    name: PROVIDER_NAMES.TRON_LOCAL_2,
    availabilityConfig: {
      ENERGY: PROVIDER_AVAILABILITY_CONFIG.TRON_LOCAL_2.ENERGY,
      BANDWIDTH: PROVIDER_AVAILABILITY_CONFIG.TRON_LOCAL_2.BANDWIDTH,
      ACTIVATION: PROVIDER_AVAILABILITY_CONFIG.TRON_LOCAL_2.ACTIVATION,
    },
  },
  {
    name: PROVIDER_NAMES.TRON_LOCAL_3,
    availabilityConfig: {
      ENERGY: PROVIDER_AVAILABILITY_CONFIG.TRON_LOCAL_3.ENERGY,
      BANDWIDTH: PROVIDER_AVAILABILITY_CONFIG.TRON_LOCAL_3.BANDWIDTH,
      ACTIVATION: PROVIDER_AVAILABILITY_CONFIG.TRON_LOCAL_3.ACTIVATION,
    },
  },
  {
    name: PROVIDER_NAMES.TRON_LOCAL,
    availabilityConfig: {
      ENERGY: PROVIDER_AVAILABILITY_CONFIG.TRON_LOCAL.ENERGY,
      BANDWIDTH: PROVIDER_AVAILABILITY_CONFIG.TRON_LOCAL.BANDWIDTH,
      ACTIVATION: PROVIDER_AVAILABILITY_CONFIG.TRON_LOCAL.ACTIVATION,
    },
  },
];

export const validOrderId = 1;

export const TEST_USER_ID_UUID = "123e4567-e89b-12d3-a456-426614174000";

export const RATE_LIMIT_TEST_REQUEST_COUNT = 120;