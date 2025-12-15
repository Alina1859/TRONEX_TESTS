import {
  BANDWIDTH_ALLOWED_PERIODS,
  BANDWIDTH_AMOUNT_MAX,
  BANDWIDTH_AMOUNT_DEFAULT,
  BANDWIDTH_AMOUNT_MIN,
  ENERGY_ALLOWED_PERIODS,
  ENERGY_AMOUNT_MAX,
  ENERGY_AMOUNT_DEFAULT,
  ENERGY_AMOUNT_MIN,
  OrderPeriod,
  VALID_ORDER_PERIODS,
} from "../../../shared/utils/constants";

type CreateOrderRequestVariation = {
  data: any;
  description: string;
  expectedStatus?: number;
};

// Примеры заведомо невалидных значений type
const invalidOrderTypes = {
  empty: "",
  typo: "ENERG",
  lowerCase: "energy",
  withSpaces: " ENERGY ",
  number: 123,
  zero: 0,
  nullValue: null,
  undefinedValue: undefined,
};

// Примеры заведомо невалидных адресов TRON (base58)
const invalidTronAddresses = {
  empty: "",
  // валидный адрес, но с пробелами/переносами — часто забывают trim
  surroundedSpaces: " TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh ",
  wrappedNewlines: "\nTEawueJHVuwwn7M9xnVsB7oWXribW4hcwh\n",
  short: "T123",
  long: "T" + "A".repeat(100),
  wrongPrefix: "A" + "1".repeat(33),
  notBase58: "T0OIl" + "!@#$".repeat(10),
  nullValue: null,
  zero: 0,
  undefinedValue: undefined,
  number: 123,
};

// Примеры заведомо невалидных значений amount (с учётом min/max для каждого типа)
const invalidOrderAmounts = {
  energy: {
    belowMin: ENERGY_AMOUNT_MIN - 1,
    aboveMax: ENERGY_AMOUNT_MAX + 1,
    zero: 0,
    negative: -1,
    float: 1.5,
    nanValue: Number.NaN,
    infinityValue: Number.POSITIVE_INFINITY,
    maxSafeInteger: Number.MAX_SAFE_INTEGER,
    stringValue: `${ENERGY_AMOUNT_DEFAULT}`,
    nullValue: null,
    undefinedValue: undefined,
  },
  bandwidth: {
    belowMin: BANDWIDTH_AMOUNT_MIN - 1,
    aboveMax: BANDWIDTH_AMOUNT_MAX + 1,
    zero: 0,
    negative: -1,
    float: 1.5,
    nanValue: Number.NaN,
    infinityValue: Number.POSITIVE_INFINITY,
    maxSafeInteger: Number.MAX_SAFE_INTEGER,
    stringValue: `${BANDWIDTH_AMOUNT_DEFAULT}`,
    nullValue: null,
    undefinedValue: undefined,
  },
};

// Примеры заведомо невалидных значений period (с учётом allowed periods для каждого типа)
const invalidOrderPeriods = {
  energy: {
    zero: 0,
    negative: -OrderPeriod.ONE_HOUR,
    // Берём валидный OrderPeriod, который НЕ разрешён для ENERGY
    notAllowed:
      VALID_ORDER_PERIODS.find(
        (p) => !(ENERGY_ALLOWED_PERIODS as readonly OrderPeriod[]).includes(p)
      ) ?? OrderPeriod.SIX_HOURS,
    // Граничные значения (вокруг разрешённых)
    belowMinAllowed: ENERGY_ALLOWED_PERIODS[0] - 1,
    aboveMaxAllowed: ENERGY_ALLOWED_PERIODS[ENERGY_ALLOWED_PERIODS.length - 1] + 1,
    maxSafeInteger: Number.MAX_SAFE_INTEGER,
    infinityValue: Number.POSITIVE_INFINITY,
    nanValue: Number.NaN,
    floatValue: 1.5,
    randomNumber: 123,
    emptyString: "",
    stringValue: `${ENERGY_ALLOWED_PERIODS[0]}`,
    nullValue: null,
    undefinedValue: undefined,
    objectValue: {},
    arrayValue: [],
    booleanValue: true,
  },
  bandwidth: {
    zero: 0,
    negative: -OrderPeriod.ONE_HOUR,
    // Для BANDWIDTH удобно брать период, разрешённый для ENERGY, но не разрешённый для BANDWIDTH (например, THREE_DAYS)
    notAllowed:
      (ENERGY_ALLOWED_PERIODS as readonly OrderPeriod[]).find(
        (p) => !(BANDWIDTH_ALLOWED_PERIODS as readonly OrderPeriod[]).includes(p)
      ) ?? OrderPeriod.THREE_DAYS,
    // Граничные значения (вокруг разрешённых)
    belowMinAllowed: BANDWIDTH_ALLOWED_PERIODS[0] - 1,
    aboveMaxAllowed: BANDWIDTH_ALLOWED_PERIODS[BANDWIDTH_ALLOWED_PERIODS.length - 1] + 1,
    maxSafeInteger: Number.MAX_SAFE_INTEGER,
    infinityValue: Number.POSITIVE_INFINITY,
    nanValue: Number.NaN,
    floatValue: 1.5,
    randomNumber: 123,
    emptyString: "",
    stringValue: `${BANDWIDTH_ALLOWED_PERIODS[0]}`,
    nullValue: null,
    undefinedValue: undefined,
    objectValue: {},
    arrayValue: [],
    booleanValue: true,
  },
};

// Валидный базовый payload, чтобы в кейсах "нет поля X" отсутствовало ровно одно поле.
const validTargetAddress = "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh";

const validEnergyBaseRequest = {
  type: "ENERGY",
  targetAddress: validTargetAddress,
  amount: ENERGY_AMOUNT_DEFAULT,
  period: ENERGY_ALLOWED_PERIODS[0],
};

const validBandwidthBaseRequest = {
  type: "BANDWIDTH",
  targetAddress: validTargetAddress,
  amount: BANDWIDTH_AMOUNT_DEFAULT,
  period: BANDWIDTH_ALLOWED_PERIODS[0],
};

const validActivationBaseRequest = {
  type: "ACTIVATION",
  targetAddress: validTargetAddress,
};

export const invalidCreateOrderRequestVariations: CreateOrderRequestVariation[] = [
  // Тело запроса не объект
  { data: null, description: "body = null", expectedStatus: 400 },
  { data: undefined, description: "body = undefined", expectedStatus: 400 },
  { data: "string", description: "body = строка", expectedStatus: 400 },
  { data: 123, description: "body = число", expectedStatus: 400 },
  { data: [], description: "body = массив []", expectedStatus: 400 },

  // Отсутствуют обязательные поля
  { data: {}, description: "пустой объект {}", expectedStatus: 400 },
  {
    data: { targetAddress: validTargetAddress, amount: ENERGY_AMOUNT_DEFAULT, period: ENERGY_ALLOWED_PERIODS[0] },
    description: "нет поля type",
    expectedStatus: 400,
  },
  {
    data: { type: "ENERGY", amount: validEnergyBaseRequest.amount, period: validEnergyBaseRequest.period },
    description: "нет поля targetAddress (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: { type: "ENERGY", targetAddress: validTargetAddress, amount: validEnergyBaseRequest.amount },
    description: "нет поля period (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      amount: validBandwidthBaseRequest.amount,
      period: validBandwidthBaseRequest.period,
    },
    description: "нет поля targetAddress (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: { type: "BANDWIDTH", targetAddress: validTargetAddress, amount: validBandwidthBaseRequest.amount },
    description: "нет поля period (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: { type: validActivationBaseRequest.type },
    description: "нет поля targetAddress (ACTIVATION)",
    expectedStatus: 400,
  },

  // Некорректный type
  {
    data: {
      type: invalidOrderTypes.empty,
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "type = пустая строка",
    expectedStatus: 400,
  },
  {
    data: {
      type: invalidOrderTypes.typo,
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: 'type = "ENERG" (опечатка)',
    expectedStatus: 400,
  },
  {
    data: {
      type: invalidOrderTypes.number,
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "type = число (123)",
    expectedStatus: 400,
  },
  {
    data: {
      type: invalidOrderTypes.zero,
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "type = 0",
    expectedStatus: 400,
  },
  {
    data: {
      type: invalidOrderTypes.nullValue,
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "type = null",
    expectedStatus: 400,
  },
  {
    data: {
      type: invalidOrderTypes.undefinedValue,
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "type = undefined",
    expectedStatus: 400,
  },
  {
    data: {
      type: invalidOrderTypes.lowerCase,
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: 'type = "energy" (lowercase)',
    expectedStatus: 400,
  },
  {
    data: {
      type: invalidOrderTypes.withSpaces,
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: 'type = " ENERGY " (пробелы)',
    expectedStatus: 400,
  },

  // Некорректный targetAddress
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.empty,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress пустая строка",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.empty,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress пустая строка (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: { type: "ENERGY", targetAddress: invalidTronAddresses.surroundedSpaces, amount: ENERGY_AMOUNT_DEFAULT, period: OrderPeriod.ONE_HOUR },
    description: "targetAddress с пробелами по краям (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.surroundedSpaces,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress с пробелами по краям (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.surroundedSpaces },
    description: "targetAddress с пробелами по краям (ACTIVATION)",
    expectedStatus: 400,
  },
  {
    data: { type: "ENERGY", targetAddress: invalidTronAddresses.wrappedNewlines, amount: ENERGY_AMOUNT_DEFAULT, period: OrderPeriod.ONE_HOUR },
    description: "targetAddress с переносами строк (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.wrappedNewlines,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress с переносами строк (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.wrappedNewlines },
    description: "targetAddress с переносами строк (ACTIVATION)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.short,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress слишком короткий",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.short,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress слишком короткий (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.long,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress слишком длинный",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.long,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress слишком длинный (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.wrongPrefix,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress неправильный префикс (не 'T')",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.wrongPrefix,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress неправильный префикс (не 'T') (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.notBase58,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress не base58 (спецсимволы/0/O/I/l)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.notBase58,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress не base58 (спецсимволы/0/O/I/l) (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.nullValue,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = null",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.nullValue,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = null (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.undefinedValue,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = undefined",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.undefinedValue,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = undefined (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.zero,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = 0",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.zero,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = 0 (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.number,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = число",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.number,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = число (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.empty },
    description: "targetAddress пустая строка (ACTIVATION)",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.short },
    description: "targetAddress слишком короткий (ACTIVATION)",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.long },
    description: "targetAddress слишком длинный (ACTIVATION)",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.wrongPrefix },
    description: "targetAddress неправильный префикс (не 'T') (ACTIVATION)",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.notBase58 },
    description: "targetAddress не base58 (спецсимволы/0/O/I/l) (ACTIVATION)",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.nullValue },
    description: "targetAddress = null (ACTIVATION)",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.undefinedValue },
    description: "targetAddress = undefined (ACTIVATION)",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.zero },
    description: "targetAddress = 0 (ACTIVATION)",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.number },
    description: "targetAddress = число (ACTIVATION)",
    expectedStatus: 400,
  },

  // Некорректный amount (ENERGY)
  {
    data: { ...validEnergyBaseRequest, amount: invalidOrderAmounts.energy.belowMin, period: OrderPeriod.ONE_HOUR },
    description: `ENERGY: amount меньше min (${ENERGY_AMOUNT_MIN - 1})`,
    expectedStatus: 400,
  },
  {
    data: { ...validEnergyBaseRequest, amount: invalidOrderAmounts.energy.aboveMax, period: OrderPeriod.ONE_HOUR },
    description: `ENERGY: amount больше max (${ENERGY_AMOUNT_MAX + 1})`,
    expectedStatus: 400,
  },
  {
    data: { ...validEnergyBaseRequest, amount: invalidOrderAmounts.energy.zero, period: OrderPeriod.ONE_HOUR },
    description: "ENERGY: amount = 0",
    expectedStatus: 400,
  },
  {
    data: { ...validEnergyBaseRequest, amount: invalidOrderAmounts.energy.negative, period: OrderPeriod.ONE_HOUR },
    description: "ENERGY: amount отрицательный (-1)",
    expectedStatus: 400,
  },
  {
    data: { ...validEnergyBaseRequest, amount: invalidOrderAmounts.energy.float, period: OrderPeriod.ONE_HOUR },
    description: "ENERGY: amount дробный (1.5)",
    expectedStatus: 400,
  },
  {
    data: { ...validEnergyBaseRequest, amount: invalidOrderAmounts.energy.nanValue, period: OrderPeriod.ONE_HOUR },
    description: "ENERGY: amount = NaN",
    expectedStatus: 400,
  },
  {
    data: { ...validEnergyBaseRequest, amount: invalidOrderAmounts.energy.infinityValue, period: OrderPeriod.ONE_HOUR },
    description: "ENERGY: amount = Infinity",
    expectedStatus: 400,
  },
  {
    data: { ...validEnergyBaseRequest, amount: invalidOrderAmounts.energy.maxSafeInteger, period: OrderPeriod.ONE_HOUR },
    description: "ENERGY: amount = Number.MAX_SAFE_INTEGER",
    expectedStatus: 400,
  },
  {
    data: {
      ...validEnergyBaseRequest,
      amount: invalidOrderAmounts.energy.stringValue,
      period: OrderPeriod.ONE_HOUR,
    },
    description: `ENERGY: amount строка '${ENERGY_AMOUNT_DEFAULT}'`,
    expectedStatus: 400,
  },
  {
    data: { ...validEnergyBaseRequest, amount: invalidOrderAmounts.energy.nullValue, period: OrderPeriod.ONE_HOUR },
    description: "ENERGY: amount = null",
    expectedStatus: 400,
  },

  // Некорректный amount (BANDWIDTH)
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.belowMin,
      period: OrderPeriod.ONE_HOUR,
    },
    description: `BANDWIDTH: amount меньше min (${BANDWIDTH_AMOUNT_MIN - 1})`,
    expectedStatus: 400,
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.aboveMax,
      period: OrderPeriod.ONE_HOUR,
    },
    description: `BANDWIDTH: amount больше max (${BANDWIDTH_AMOUNT_MAX + 1})`,
    expectedStatus: 400,
  },
  {
    data: { ...validBandwidthBaseRequest, amount: invalidOrderAmounts.bandwidth.zero, period: OrderPeriod.ONE_HOUR },
    description: "BANDWIDTH: amount = 0",
    expectedStatus: 400,
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.negative,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "BANDWIDTH: amount отрицательный (-1)",
    expectedStatus: 400,
  },
  {
    data: { ...validBandwidthBaseRequest, amount: invalidOrderAmounts.bandwidth.float, period: OrderPeriod.ONE_HOUR },
    description: "BANDWIDTH: amount дробный (1.5)",
    expectedStatus: 400,
  },
  {
    data: { ...validBandwidthBaseRequest, amount: invalidOrderAmounts.bandwidth.nanValue, period: OrderPeriod.ONE_HOUR },
    description: "BANDWIDTH: amount = NaN",
    expectedStatus: 400,
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.infinityValue,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "BANDWIDTH: amount = Infinity",
    expectedStatus: 400,
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.maxSafeInteger,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "BANDWIDTH: amount = Number.MAX_SAFE_INTEGER",
    expectedStatus: 400,
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.stringValue,
      period: OrderPeriod.ONE_HOUR,
    },
    description: `BANDWIDTH: amount строка '${BANDWIDTH_AMOUNT_DEFAULT}'`,
    expectedStatus: 400,
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.nullValue,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "BANDWIDTH: amount = null",
    expectedStatus: 400,
  },

  // Некорректный period (для ENERGY/BANDWIDTH)
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.zero,
    },
    description: "period = 0",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.zero,
    },
    description: "period = 0 (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.negative,
    },
    description: "period отрицательный",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.negative,
    },
    description: "period отрицательный (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.notAllowed,
    },
    description: `period не из списка допустимых (${invalidOrderPeriods.energy.notAllowed})`,
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.notAllowed,
    },
    description: `period не из списка допустимых для BANDWIDTH (${invalidOrderPeriods.bandwidth.notAllowed})`,
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.belowMinAllowed,
    },
    description: `period на 1 меньше минимального разрешённого (${invalidOrderPeriods.energy.belowMinAllowed}) (ENERGY)`,
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.belowMinAllowed,
    },
    description: `period на 1 меньше минимального разрешённого (${invalidOrderPeriods.bandwidth.belowMinAllowed}) (BANDWIDTH)`,
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.aboveMaxAllowed,
    },
    description: `period на 1 больше максимального разрешённого (${invalidOrderPeriods.energy.aboveMaxAllowed}) (ENERGY)`,
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.aboveMaxAllowed,
    },
    description: `period на 1 больше максимального разрешённого (${invalidOrderPeriods.bandwidth.aboveMaxAllowed}) (BANDWIDTH)`,
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.maxSafeInteger,
    },
    description: `period = Number.MAX_SAFE_INTEGER (ENERGY)`,
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.maxSafeInteger,
    },
    description: `period = Number.MAX_SAFE_INTEGER (BANDWIDTH)`,
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.infinityValue,
    },
    description: "period = Infinity (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.infinityValue,
    },
    description: "period = Infinity (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.nanValue,
    },
    description: "period = NaN (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.nanValue,
    },
    description: "period = NaN (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.stringValue,
    },
    description: `period строка '${invalidOrderPeriods.energy.stringValue}'`,
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.stringValue,
    },
    description: `period строка '${invalidOrderPeriods.bandwidth.stringValue}' (BANDWIDTH)`,
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.emptyString,
    },
    description: "period пустая строка (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.emptyString,
    },
    description: "period пустая строка (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.floatValue,
    },
    description: "period дробный (1.5) (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.floatValue,
    },
    description: "period дробный (1.5) (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.randomNumber,
    },
    description: "period произвольное число (123) (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.randomNumber,
    },
    description: "period произвольное число (123) (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.objectValue,
    },
    description: "period объект {} (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.objectValue,
    },
    description: "period объект {} (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.arrayValue,
    },
    description: "period массив [] (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.arrayValue,
    },
    description: "period массив [] (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.booleanValue,
    },
    description: "period boolean true (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.booleanValue,
    },
    description: "period boolean true (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.nullValue,
    },
    description: "period = null (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.nullValue,
    },
    description: "period = null (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.undefinedValue,
    },
    description: "period = undefined (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.undefinedValue,
    },
    description: "period = undefined (BANDWIDTH)",
    expectedStatus: 400,
  },

  // Лишние поля для ACTIVATION
  {
    data: {
      type: "ACTIVATION",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
    },
    description: "ACTIVATION: лишнее поле amount",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ACTIVATION",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      period: OrderPeriod.ONE_HOUR,
    },
    description: "ACTIVATION: лишнее поле period",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ACTIVATION",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "ACTIVATION: лишние поля amount+period",
    expectedStatus: 400,
  },
];

