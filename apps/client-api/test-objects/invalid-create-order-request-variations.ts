// Набор невалидных payload'ов для POST /api/v2/orders/
// Использовать в параметризованных тестах создания заказа.

type CreateOrderRequestVariation = {
  data: any;
  description: string;
  // На разных стендах может быть 400/422, поэтому оставляем переопределяемым.
  expectedStatus?: number;
};

// Примеры заведомо невалидных адресов TRON (base58)
const invalidTronAddresses = {
  empty: "",
  short: "T123",
  long: "T" + "A".repeat(100),
  wrongPrefix: "A" + "1".repeat(33),
  notBase58: "T0OIl" + "!@#$".repeat(10),
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
    data: { targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh" },
    description: "нет поля type",
    expectedStatus: 400,
  },
  { data: { type: "ENERGY" }, description: "нет поля targetAddress (ENERGY)", expectedStatus: 400 },
  {
    data: { type: "BANDWIDTH" },
    description: "нет поля targetAddress (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION" },
    description: "нет поля targetAddress (ACTIVATION)",
    expectedStatus: 400,
  },
  {
    data: { type: "ENERGY", targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh", period: 3600000 },
    description: "нет поля amount (ENERGY)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      period: 3600000,
    },
    description: "нет поля amount (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: { type: "BANDWIDTH", targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh", amount: 65000 },
    description: "нет поля period (BANDWIDTH)",
    expectedStatus: 400,
  },

  // Некорректный type
  {
    data: {
      type: "ENERG",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
      period: 3600000,
    },
    description: 'type = "ENERG" (опечатка)',
    expectedStatus: 400,
  },
  {
    data: {
      type: 123,
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
      period: 3600000,
    },
    description: "type = число (123)",
    expectedStatus: 400,
  },
  {
    data: {
      type: null,
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
      period: 3600000,
    },
    description: "type = null",
    expectedStatus: 400,
  },

  // Некорректный targetAddress
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.empty,
      amount: 65000,
      period: 3600000,
    },
    description: "targetAddress пустая строка",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.empty,
      amount: 65000,
      period: 3600000,
    },
    description: "targetAddress пустая строка (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.short,
      amount: 65000,
      period: 3600000,
    },
    description: "targetAddress слишком короткий",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.short,
      amount: 65000,
      period: 3600000,
    },
    description: "targetAddress слишком короткий (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.long,
      amount: 65000,
      period: 3600000,
    },
    description: "targetAddress слишком длинный",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: invalidTronAddresses.long,
      amount: 65000,
      period: 3600000,
    },
    description: "targetAddress слишком длинный (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.wrongPrefix,
      amount: 65000,
      period: 3600000,
    },
    description: "targetAddress неправильный префикс (не 'T')",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: invalidTronAddresses.notBase58,
      amount: 65000,
      period: 3600000,
    },
    description: "targetAddress не base58 (спецсимволы/0/O/I/l)",
    expectedStatus: 400,
  },
  {
    data: { type: "ENERGY", targetAddress: null, amount: 65000, period: 3600000 },
    description: "targetAddress = null",
    expectedStatus: 400,
  },
  {
    data: { type: "BANDWIDTH", targetAddress: null, amount: 65000, period: 3600000 },
    description: "targetAddress = null (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: { type: "ENERGY", targetAddress: 123, amount: 65000, period: 3600000 },
    description: "targetAddress = число",
    expectedStatus: 400,
  },
  {
    data: { type: "BANDWIDTH", targetAddress: 123, amount: 65000, period: 3600000 },
    description: "targetAddress = число (BANDWIDTH)",
    expectedStatus: 400,
  },

  // Некорректный amount (для ENERGY/BANDWIDTH)
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 0,
      period: 3600000,
    },
    description: "amount = 0",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: -1,
      period: 3600000,
    },
    description: "amount отрицательный (-1)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 1.5,
      period: 3600000,
    },
    description: "amount дробный (1.5)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: "65000",
      period: 3600000,
    },
    description: "amount строка '65000'",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: null,
      period: 3600000,
    },
    description: "amount = null",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: null,
      period: 3600000,
    },
    description: "amount = null (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 0,
      period: 3600000,
    },
    description: "amount = 0 (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: -1,
      period: 3600000,
    },
    description: "amount отрицательный (-1) (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: "65000",
      period: 3600000,
    },
    description: "amount строка '65000' (BANDWIDTH)",
    expectedStatus: 400,
  },

  // Некорректный period (для ENERGY/BANDWIDTH)
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
      period: 0,
    },
    description: "period = 0",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
      period: 0,
    },
    description: "period = 0 (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
      period: -3600000,
    },
    description: "period отрицательный",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
      period: -3600000,
    },
    description: "period отрицательный (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
      period: 7200000,
    },
    description: "period не из списка допустимых (7200000)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
      period: 259200000,
    },
    description: "period не из списка допустимых для BANDWIDTH (259200000)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
      period: "3600000",
    },
    description: "period строка '3600000'",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
      period: "3600000",
    },
    description: "period строка '3600000' (BANDWIDTH)",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
      // отсутствует period
    },
    description: "нет поля period для ENERGY",
    expectedStatus: 400,
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
      period: null,
    },
    description: "period = null (BANDWIDTH)",
    expectedStatus: 400,
  },

  // Невалидный ACTIVATION
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.empty },
    description: "ACTIVATION: пустой targetAddress",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.short },
    description: "ACTIVATION: слишком короткий targetAddress",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: invalidTronAddresses.long },
    description: "ACTIVATION: слишком длинный targetAddress",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: null },
    description: "ACTIVATION: targetAddress = null",
    expectedStatus: 400,
  },
  {
    data: { type: "ACTIVATION", targetAddress: 123 },
    description: "ACTIVATION: targetAddress = число",
    expectedStatus: 400,
  },
  // Лишние поля для ACTIVATION (должны отклоняться)
  {
    data: {
      type: "ACTIVATION",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
    },
    description: "ACTIVATION: лишнее поле amount",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ACTIVATION",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      period: 3600000,
    },
    description: "ACTIVATION: лишнее поле period",
    expectedStatus: 400,
  },
  {
    data: {
      type: "ACTIVATION",
      targetAddress: "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh",
      amount: 65000,
      period: 3600000,
    },
    description: "ACTIVATION: лишние поля amount+period",
    expectedStatus: 400,
  },
];

// Иногда удобно тестировать по группам
export const invalidEnergyCreateOrderRequestVariations = invalidCreateOrderRequestVariations.filter(
  (v) => v?.data?.type === "ENERGY"
);

export const invalidActivationCreateOrderRequestVariations =
  invalidCreateOrderRequestVariations.filter((v) => v?.data?.type === "ACTIVATION");

export const invalidBandwidthCreateOrderRequestVariations =
  invalidCreateOrderRequestVariations.filter((v) => v?.data?.type === "BANDWIDTH");
