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
} from "@shared/utils/constants";
import { CreateOrderRequestVariation } from "@shared/utils/types";

export const validTargetAddress = "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh";

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

const invalidTronAddresses = {
  empty: "",
  surroundedSpaces: ` ${validTargetAddress} `,
  wrappedNewlines: `\n${validTargetAddress}\n`,
  short: "T123",
  long: "T" + "A".repeat(100),
  wrongPrefix: "A" + "1".repeat(33),
  notBase58: "T0OIl" + "!@#$".repeat(10),
  nullValue: null,
  zero: 0,
  undefinedValue: undefined,
  number: 123,
};

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

const invalidOrderPeriods = {
  energy: {
    zero: 0,
    negative: -OrderPeriod.ONE_HOUR,
    notAllowed:
      VALID_ORDER_PERIODS.find(
        (p) => !(ENERGY_ALLOWED_PERIODS as readonly OrderPeriod[]).includes(p)
      ) ?? OrderPeriod.SIX_HOURS,
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
    notAllowed:
      (ENERGY_ALLOWED_PERIODS as readonly OrderPeriod[]).find(
        (p) => !(BANDWIDTH_ALLOWED_PERIODS as readonly OrderPeriod[]).includes(p)
      ) ?? OrderPeriod.THREE_DAYS,
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
  { data: null, description: "body = null" },
  { data: undefined, description: "body = undefined" },
  { data: "string", description: "body = строка" },
  { data: 123, description: "body = число" },
  { data: [], description: "body = массив []" },

  { data: {}, description: "пустой объект {}" },
  {
    data: {
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: ENERGY_ALLOWED_PERIODS[0],
    },
    description: "нет поля type",
  },
  {
    data: {
      type: "ENERGY",
      amount: validEnergyBaseRequest.amount,
      period: validEnergyBaseRequest.period,
    },
    description: "нет поля targetAddress (ENERGY)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: validEnergyBaseRequest.amount,
    },
    description: "нет поля period (ENERGY)",
  },
  {
    data: {
      type: "BANDWIDTH",
      amount: validBandwidthBaseRequest.amount,
      period: validBandwidthBaseRequest.period,
    },
    description: "нет поля targetAddress (BANDWIDTH)",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: validBandwidthBaseRequest.amount,
    },
    description: "нет поля period (BANDWIDTH)",
  },
  {
    data: { type: validActivationBaseRequest.type },
    description: "нет поля targetAddress (ACTIVATION)",
  },

  {
    data: {
      type: invalidOrderTypes.empty,
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "type = пустая строка",
  },
  {
    data: {
      type: invalidOrderTypes.typo,
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: 'type = "ENERG" (опечатка)',
  },
  {
    data: {
      type: invalidOrderTypes.number,
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "type = число (123)",
  },
  {
    data: {
      type: invalidOrderTypes.zero,
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "type = 0",
  },
  {
    data: {
      type: invalidOrderTypes.nullValue,
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "type = null",
  },
  {
    data: {
      type: invalidOrderTypes.undefinedValue,
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "type = undefined",
  },
  {
    data: {
      type: invalidOrderTypes.lowerCase,
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: 'type = "energy" (lowercase)',
  },
  {
    data: {
      type: invalidOrderTypes.withSpaces,
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: 'type = " ENERGY " (пробелы)',
  },

  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.empty,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress пустая строка",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.empty,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress пустая строка (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.surroundedSpaces,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress с пробелами по краям (ENERGY)",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.surroundedSpaces,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress с пробелами по краям (BANDWIDTH)",
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.surroundedSpaces },
    description: "targetAddress с пробелами по краям (ACTIVATION)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.wrappedNewlines,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress с переносами строк (ENERGY)",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.wrappedNewlines,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress с переносами строк (BANDWIDTH)",
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.wrappedNewlines },
    description: "targetAddress с переносами строк (ACTIVATION)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.short,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress слишком короткий",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.short,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress слишком короткий (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.long,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress слишком длинный",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.long,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress слишком длинный (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.wrongPrefix,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress неправильный префикс (не 'T')",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.wrongPrefix,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress неправильный префикс (не 'T') (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.notBase58,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress не base58 (спецсимволы/0/O/I/l)",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.notBase58,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress не base58 (спецсимволы/0/O/I/l) (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.nullValue,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = null",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.nullValue,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = null (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.undefinedValue,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = undefined",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.undefinedValue,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = undefined (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.zero,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = 0",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.zero,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = 0 (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.number,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = число",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.number,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "targetAddress = число (BANDWIDTH)",
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.empty },
    description: "targetAddress пустая строка (ACTIVATION)",
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.short },
    description: "targetAddress слишком короткий (ACTIVATION)",
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.long },
    description: "targetAddress слишком длинный (ACTIVATION)",
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.wrongPrefix },
    description: "targetAddress неправильный префикс (не 'T') (ACTIVATION)",
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.notBase58 },
    description: "targetAddress не base58 (спецсимволы/0/O/I/l) (ACTIVATION)",
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.nullValue },
    description: "targetAddress = null (ACTIVATION)",
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.undefinedValue },
    description: "targetAddress = undefined (ACTIVATION)",
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.zero },
    description: "targetAddress = 0 (ACTIVATION)",
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.number },
    description: "targetAddress = число (ACTIVATION)",
  },

  {
    data: {
      ...validEnergyBaseRequest,
      amount: invalidOrderAmounts.energy.belowMin,
      period: OrderPeriod.ONE_HOUR,
    },
    description: `ENERGY: amount меньше min (${ENERGY_AMOUNT_MIN - 1})`,
  },
  {
    data: {
      ...validEnergyBaseRequest,
      amount: invalidOrderAmounts.energy.aboveMax,
      period: OrderPeriod.ONE_HOUR,
    },
    description: `ENERGY: amount больше max (${ENERGY_AMOUNT_MAX + 1})`,
  },
  {
    data: {
      ...validEnergyBaseRequest,
      amount: invalidOrderAmounts.energy.zero,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "ENERGY: amount = 0",
  },
  {
    data: {
      ...validEnergyBaseRequest,
      amount: invalidOrderAmounts.energy.negative,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "ENERGY: amount отрицательный (-1)",
  },
  {
    data: {
      ...validEnergyBaseRequest,
      amount: invalidOrderAmounts.energy.float,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "ENERGY: amount дробный (1.5)",
  },
  {
    data: {
      ...validEnergyBaseRequest,
      amount: invalidOrderAmounts.energy.nanValue,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "ENERGY: amount = NaN",
  },
  {
    data: {
      ...validEnergyBaseRequest,
      amount: invalidOrderAmounts.energy.infinityValue,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "ENERGY: amount = Infinity",
  },
  {
    data: {
      ...validEnergyBaseRequest,
      amount: invalidOrderAmounts.energy.maxSafeInteger,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "ENERGY: amount = Number.MAX_SAFE_INTEGER",
  },
  {
    data: {
      ...validEnergyBaseRequest,
      amount: invalidOrderAmounts.energy.stringValue,
      period: OrderPeriod.ONE_HOUR,
    },
    description: `ENERGY: amount строка '${ENERGY_AMOUNT_DEFAULT}'`,
  },
  {
    data: {
      ...validEnergyBaseRequest,
      amount: invalidOrderAmounts.energy.nullValue,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "ENERGY: amount = null",
  },

  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.belowMin,
      period: OrderPeriod.ONE_HOUR,
    },
    description: `BANDWIDTH: amount меньше min (${BANDWIDTH_AMOUNT_MIN - 1})`,
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.aboveMax,
      period: OrderPeriod.ONE_HOUR,
    },
    description: `BANDWIDTH: amount больше max (${BANDWIDTH_AMOUNT_MAX + 1})`,
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.zero,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "BANDWIDTH: amount = 0",
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.negative,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "BANDWIDTH: amount отрицательный (-1)",
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.float,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "BANDWIDTH: amount дробный (1.5)",
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.nanValue,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "BANDWIDTH: amount = NaN",
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.infinityValue,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "BANDWIDTH: amount = Infinity",
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.maxSafeInteger,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "BANDWIDTH: amount = Number.MAX_SAFE_INTEGER",
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.stringValue,
      period: OrderPeriod.ONE_HOUR,
    },
    description: `BANDWIDTH: amount строка '${BANDWIDTH_AMOUNT_DEFAULT}'`,
  },
  {
    data: {
      ...validBandwidthBaseRequest,
      amount: invalidOrderAmounts.bandwidth.nullValue,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "BANDWIDTH: amount = null",
  },

  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.zero,
    },
    description: "period = 0",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.zero,
    },
    description: "period = 0 (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.negative,
    },
    description: "period отрицательный",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.negative,
    },
    description: "period отрицательный (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.notAllowed,
    },
    description: `period не из списка допустимых (${invalidOrderPeriods.energy.notAllowed})`,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.notAllowed,
    },
    description: `period не из списка допустимых для BANDWIDTH (${invalidOrderPeriods.bandwidth.notAllowed})`,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.belowMinAllowed,
    },
    description: `period на 1 меньше минимального разрешённого (${invalidOrderPeriods.energy.belowMinAllowed}) (ENERGY)`,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.belowMinAllowed,
    },
    description: `period на 1 меньше минимального разрешённого (${invalidOrderPeriods.bandwidth.belowMinAllowed}) (BANDWIDTH)`,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.aboveMaxAllowed,
    },
    description: `period на 1 больше максимального разрешённого (${invalidOrderPeriods.energy.aboveMaxAllowed}) (ENERGY)`,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.aboveMaxAllowed,
    },
    description: `period на 1 больше максимального разрешённого (${invalidOrderPeriods.bandwidth.aboveMaxAllowed}) (BANDWIDTH)`,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.maxSafeInteger,
    },
    description: `period = Number.MAX_SAFE_INTEGER (ENERGY)`,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.maxSafeInteger,
    },
    description: `period = Number.MAX_SAFE_INTEGER (BANDWIDTH)`,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.infinityValue,
    },
    description: "period = Infinity (ENERGY)",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.infinityValue,
    },
    description: "period = Infinity (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.nanValue,
    },
    description: "period = NaN (ENERGY)",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.nanValue,
    },
    description: "period = NaN (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.stringValue,
    },
    description: `period строка '${invalidOrderPeriods.energy.stringValue}'`,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.stringValue,
    },
    description: `period строка '${invalidOrderPeriods.bandwidth.stringValue}' (BANDWIDTH)`,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.emptyString,
    },
    description: "period пустая строка (ENERGY)",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.emptyString,
    },
    description: "period пустая строка (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.floatValue,
    },
    description: "period дробный (1.5) (ENERGY)",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.floatValue,
    },
    description: "period дробный (1.5) (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.randomNumber,
    },
    description: "period произвольное число (123) (ENERGY)",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.randomNumber,
    },
    description: "period произвольное число (123) (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.objectValue,
    },
    description: "period объект {} (ENERGY)",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.objectValue,
    },
    description: "period объект {} (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.arrayValue,
    },
    description: "period массив [] (ENERGY)",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.arrayValue,
    },
    description: "period массив [] (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.booleanValue,
    },
    description: "period boolean true (ENERGY)",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.booleanValue,
    },
    description: "period boolean true (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.nullValue,
    },
    description: "period = null (ENERGY)",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.nullValue,
    },
    description: "period = null (BANDWIDTH)",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.energy.undefinedValue,
    },
    description: "period = undefined (ENERGY)",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: invalidOrderPeriods.bandwidth.undefinedValue,
    },
    description: "period = undefined (BANDWIDTH)",
  },
];
