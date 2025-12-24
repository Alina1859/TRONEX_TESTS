import { CreateOrderRequestVariation } from "@shared/utils/types";

export const validFromAddress = "TEawueJHVuwwn7M9xnVsB7oWXribW4hcwh";
export const validToAddress = "TQn9Y2khEsLMWTZtWqj2F6dvm2CnXqojCy";

const invalidTronAddresses = {
  empty: "",
  surroundedSpaces: ` ${validFromAddress} `,
  wrappedNewlines: `\n${validFromAddress}\n`,
  short: "T123",
  long: "T" + "A".repeat(100),
  wrongPrefix: "A" + "1".repeat(33),
  notBase58: "T0OIl" + "!@#$".repeat(10),
  nullValue: null,
  zero: 0,
  undefinedValue: undefined,
  number: 123,
  objectValue: {},
  arrayValue: [],
  booleanTrue: true,
  booleanFalse: false,
  stringNumber: "123",
};

const invalidBooleanValues = {
  nullValue: null,
  undefinedValue: undefined,
  zero: 0,
  one: 1,
  negative: -1,
  stringTrue: "true",
  stringFalse: "false",
  stringYes: "yes",
  stringNo: "no",
  emptyString: "",
  number: 123,
  float: 1.5,
  nanValue: Number.NaN,
  infinityValue: Number.POSITIVE_INFINITY,
  objectValue: {},
  arrayValue: [],
  stringValue: "boolean",
};

const validSmartOrderBaseRequest = {
  fromAddress: validFromAddress,
  toAddress: validToAddress,
  withActivation: true,
  withEnergy: true,
  withBandwidth: true,
};

export const invalidCreateSmartOrderRequestVariations: CreateOrderRequestVariation[] = [
  { data: null, description: "body = null" },
  { data: undefined, description: "body = undefined" },
  { data: "string", description: "body = строка" },
  { data: 123, description: "body = число" },
  { data: [], description: "body = массив []" },

  { data: {}, description: "пустой объект {}" },
  {
    data: {
      toAddress: validToAddress,
      withActivation: true,
      withEnergy: true,
      withBandwidth: true,
    },
    description: "нет поля fromAddress",
  },
  {
    data: {
      fromAddress: validFromAddress,
      withActivation: true,
      withEnergy: true,
      withBandwidth: true,
    },
    description: "нет поля toAddress",
  },
  {
    data: {
      fromAddress: validFromAddress,
      toAddress: validToAddress,
    },
    description: "нет полей withActivation, withEnergy, withBandwidth",
  },
  {
    data: {
      fromAddress: validFromAddress,
      toAddress: validToAddress,
      withEnergy: true,
      withBandwidth: true,
    },
    description: "нет поля withActivation",
  },
  {
    data: {
      fromAddress: validFromAddress,
      toAddress: validToAddress,
      withActivation: true,
      withBandwidth: true,
    },
    description: "нет поля withEnergy",
  },
  {
    data: {
      fromAddress: validFromAddress,
      toAddress: validToAddress,
      withActivation: true,
      withEnergy: true,
    },
    description: "нет поля withBandwidth",
  },
  {
    data: {
      fromAddress: validFromAddress,
      toAddress: validToAddress,
      withActivation: true,
    },
    description: "нет полей withEnergy и withBandwidth",
  },
  {
    data: {
      fromAddress: validFromAddress,
      toAddress: validToAddress,
      withEnergy: true,
    },
    description: "нет полей withActivation и withBandwidth",
  },
  {
    data: {
      fromAddress: validFromAddress,
      toAddress: validToAddress,
      withBandwidth: true,
    },
    description: "нет полей withActivation и withEnergy",
  },

  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.empty,
    },
    description: "fromAddress пустая строка",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.surroundedSpaces,
    },
    description: "fromAddress с пробелами по краям",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.wrappedNewlines,
    },
    description: "fromAddress с переносами строк",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.short,
    },
    description: "fromAddress слишком короткий",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.long,
    },
    description: "fromAddress слишком длинный",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.wrongPrefix,
    },
    description: "fromAddress неправильный префикс (не 'T')",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.notBase58,
    },
    description: "fromAddress не base58 (спецсимволы/0/O/I/l)",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.nullValue,
    },
    description: "fromAddress = null",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.undefinedValue,
    },
    description: "fromAddress = undefined",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.zero,
    },
    description: "fromAddress = 0",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.number,
    },
    description: "fromAddress = число",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.objectValue,
    },
    description: "fromAddress = объект {}",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.arrayValue,
    },
    description: "fromAddress = массив []",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.booleanTrue,
    },
    description: "fromAddress = boolean true",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.booleanFalse,
    },
    description: "fromAddress = boolean false",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      fromAddress: invalidTronAddresses.stringNumber,
    },
    description: 'fromAddress = строка "123"',
  },

  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.empty,
    },
    description: "toAddress пустая строка",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.surroundedSpaces,
    },
    description: "toAddress с пробелами по краям",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.wrappedNewlines,
    },
    description: "toAddress с переносами строк",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.short,
    },
    description: "toAddress слишком короткий",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.long,
    },
    description: "toAddress слишком длинный",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.wrongPrefix,
    },
    description: "toAddress неправильный префикс (не 'T')",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.notBase58,
    },
    description: "toAddress не base58 (спецсимволы/0/O/I/l)",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.nullValue,
    },
    description: "toAddress = null",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.undefinedValue,
    },
    description: "toAddress = undefined",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.zero,
    },
    description: "toAddress = 0",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.number,
    },
    description: "toAddress = число",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.objectValue,
    },
    description: "toAddress = объект {}",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.arrayValue,
    },
    description: "toAddress = массив []",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.booleanTrue,
    },
    description: "toAddress = boolean true",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.booleanFalse,
    },
    description: "toAddress = boolean false",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      toAddress: invalidTronAddresses.stringNumber,
    },
    description: 'toAddress = строка "123"',
  },

  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.nullValue,
    },
    description: "withActivation = null",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.undefinedValue,
    },
    description: "withActivation = undefined",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.zero,
    },
    description: "withActivation = 0",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.one,
    },
    description: "withActivation = 1",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.negative,
    },
    description: "withActivation = -1",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.stringTrue,
    },
    description: 'withActivation = строка "true"',
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.stringFalse,
    },
    description: 'withActivation = строка "false"',
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.stringYes,
    },
    description: 'withActivation = строка "yes"',
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.emptyString,
    },
    description: "withActivation = пустая строка",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.number,
    },
    description: "withActivation = число (123)",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.float,
    },
    description: "withActivation = дробное число (1.5)",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.nanValue,
    },
    description: "withActivation = NaN",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.infinityValue,
    },
    description: "withActivation = Infinity",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.objectValue,
    },
    description: "withActivation = объект {}",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.arrayValue,
    },
    description: "withActivation = массив []",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withActivation: invalidBooleanValues.stringValue,
    },
    description: 'withActivation = строка "boolean"',
  },

  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.nullValue,
    },
    description: "withEnergy = null",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.undefinedValue,
    },
    description: "withEnergy = undefined",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.zero,
    },
    description: "withEnergy = 0",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.one,
    },
    description: "withEnergy = 1",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.negative,
    },
    description: "withEnergy = -1",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.stringTrue,
    },
    description: 'withEnergy = строка "true"',
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.stringFalse,
    },
    description: 'withEnergy = строка "false"',
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.stringYes,
    },
    description: 'withEnergy = строка "yes"',
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.emptyString,
    },
    description: "withEnergy = пустая строка",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.number,
    },
    description: "withEnergy = число (123)",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.float,
    },
    description: "withEnergy = дробное число (1.5)",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.nanValue,
    },
    description: "withEnergy = NaN",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.infinityValue,
    },
    description: "withEnergy = Infinity",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.objectValue,
    },
    description: "withEnergy = объект {}",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.arrayValue,
    },
    description: "withEnergy = массив []",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withEnergy: invalidBooleanValues.stringValue,
    },
    description: 'withEnergy = строка "boolean"',
  },

  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.nullValue,
    },
    description: "withBandwidth = null",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.undefinedValue,
    },
    description: "withBandwidth = undefined",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.zero,
    },
    description: "withBandwidth = 0",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.one,
    },
    description: "withBandwidth = 1",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.negative,
    },
    description: "withBandwidth = -1",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.stringTrue,
    },
    description: 'withBandwidth = строка "true"',
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.stringFalse,
    },
    description: 'withBandwidth = строка "false"',
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.stringYes,
    },
    description: 'withBandwidth = строка "yes"',
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.emptyString,
    },
    description: "withBandwidth = пустая строка",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.number,
    },
    description: "withBandwidth = число (123)",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.float,
    },
    description: "withBandwidth = дробное число (1.5)",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.nanValue,
    },
    description: "withBandwidth = NaN",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.infinityValue,
    },
    description: "withBandwidth = Infinity",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.objectValue,
    },
    description: "withBandwidth = объект {}",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.arrayValue,
    },
    description: "withBandwidth = массив []",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      withBandwidth: invalidBooleanValues.stringValue,
    },
    description: 'withBandwidth = строка "boolean"',
  },

  {
    data: {
      fromAddress: invalidTronAddresses.empty,
      toAddress: invalidTronAddresses.empty,
      withActivation: true,
      withEnergy: true,
      withBandwidth: true,
    },
    description: "fromAddress и toAddress пустые строки",
  },
  {
    data: {
      fromAddress: invalidTronAddresses.nullValue,
      toAddress: invalidTronAddresses.nullValue,
      withActivation: true,
      withEnergy: true,
      withBandwidth: true,
    },
    description: "fromAddress и toAddress = null",
  },
  {
    data: {
      fromAddress: invalidTronAddresses.number,
      toAddress: invalidTronAddresses.number,
      withActivation: true,
      withEnergy: true,
      withBandwidth: true,
    },
    description: "fromAddress и toAddress = числа",
  },
  {
    data: {
      fromAddress: validFromAddress,
      toAddress: validToAddress,
      withActivation: invalidBooleanValues.nullValue,
      withEnergy: invalidBooleanValues.nullValue,
      withBandwidth: invalidBooleanValues.nullValue,
    },
    description: "withActivation, withEnergy, withBandwidth = null",
  },
  {
    data: {
      fromAddress: validFromAddress,
      toAddress: validToAddress,
      withActivation: invalidBooleanValues.stringTrue,
      withEnergy: invalidBooleanValues.stringTrue,
      withBandwidth: invalidBooleanValues.stringTrue,
    },
    description: 'withActivation, withEnergy, withBandwidth = строка "true"',
  },
  {
    data: {
      fromAddress: invalidTronAddresses.empty,
      toAddress: validToAddress,
      withActivation: invalidBooleanValues.nullValue,
      withEnergy: true,
      withBandwidth: true,
    },
    description: "fromAddress пустая строка, withActivation = null",
  },
  {
    data: {
      fromAddress: validFromAddress,
      toAddress: invalidTronAddresses.short,
      withEnergy: invalidBooleanValues.zero,
      withBandwidth: invalidBooleanValues.one,
    },
    description: "toAddress короткий, withEnergy = 0, withBandwidth = 1",
  },
  {
    data: {
      fromAddress: invalidTronAddresses.wrongPrefix,
      toAddress: invalidTronAddresses.notBase58,
      withActivation: invalidBooleanValues.stringFalse,
      withEnergy: invalidBooleanValues.objectValue,
      withBandwidth: invalidBooleanValues.arrayValue,
    },
    description: "все поля невалидные",
  },
];
