import { SMART_ORDER_ID_MIN, SMART_ORDER_ID_MAX } from "../constants";

// Граничные значения и базовые некорректные значения для проверки валидации
export const boundaryAndInvalidSmartOrderIdVariations = [
  // Граничные значения для smartOrderId (должен быть >= SMART_ORDER_ID_MIN и <= SMART_ORDER_ID_MAX)
  {
    value: SMART_ORDER_ID_MIN - 1,
    description: `Ноль (граничное значение, должно быть >= ${SMART_ORDER_ID_MIN})`,
    expectedStatus: [400, 404],
  },
  {
    value: -1,
    description: "Отрицательное число -1 (граничное значение, должно быть > 0)",
    expectedStatus: [400, 404],
  },
  {
    value: -2147483648,
    description: "Минимальное 32-битное signed integer (-2147483648)",
    expectedStatus: [400, 404],
  },
  {
    value: -1000000,
    description: "Большое отрицательное число (-1000000)",
    expectedStatus: [400, 404],
  },
  {
    value: SMART_ORDER_ID_MAX + 1,
    description: `Число больше максимального 32-битного integer (${SMART_ORDER_ID_MAX + 1})`,
    expectedStatus: [400, 404],
  },
  {
    value: SMART_ORDER_ID_MAX + 2,
    description: `Число больше максимального 32-битного integer (${SMART_ORDER_ID_MAX + 2})`,
    expectedStatus: [400, 404],
  },
  {
    value: 4294967295,
    description: "Максимальное 32-битное unsigned integer (4294967295)",
    expectedStatus: [400, 404],
  },

  // Базовые некорректные значения
  { value: -100, description: "Отрицательное число (-100)", expectedStatus: [400, 404] },
  { value: 0.5, description: "Дробное число (0.5)", expectedStatus: [400, 404] },
  { value: 1.5, description: "Дробное число (1.5)", expectedStatus: [400, 404] },
  { value: -0.1, description: "Отрицательное дробное число (-0.1)", expectedStatus: [400, 404] },
  {
    value: Number.MAX_SAFE_INTEGER + 1,
    description: "Число больше MAX_SAFE_INTEGER",
    expectedStatus: [400, 404],
  },
  {
    value: "9".repeat(100),
    description: "Очень длинное число (100 цифр)",
    expectedStatus: [400, 404],
  },
  {
    value: `${SMART_ORDER_ID_MIN - 1}`,
    description: `Строка "${SMART_ORDER_ID_MIN - 1}" (меньше минимального)`,
    expectedStatus: [400, 404],
  },
  { value: "-1", description: 'Строка "-1"', expectedStatus: [400, 404] },
  {
    value: "-2147483648",
    description: 'Строка "-2147483648" (минимальное 32-битное)',
    expectedStatus: [400, 404],
  },
  {
    value: `${SMART_ORDER_ID_MAX}`,
    description: `Строка "${SMART_ORDER_ID_MAX}" (максимальное 32-битное)`,
    expectedStatus: [400, 404],
  },
  {
    value: `${SMART_ORDER_ID_MAX + 1}`,
    description: `Строка "${SMART_ORDER_ID_MAX + 1}" (больше максимального)`,
    expectedStatus: [400, 404],
  },
  {
    value: "1" + "A".repeat(1000),
    description: "Очень длинная строка (1000 символов)",
    expectedStatus: [400, 404],
  },
  { value: "abc", description: 'Строка "abc"', expectedStatus: [400, 404] },
  { value: "1.5", description: 'Строка "1.5"', expectedStatus: [400, 404] },
  { value: "", description: "Пустая строка (ничего не введено)", expectedStatus: [400, 404] },
  { value: null, description: "null", expectedStatus: [400, 404] },
  { value: undefined, description: "undefined", expectedStatus: [400, 404] },

  // Специальные символы
  { value: "1@", description: "Символ @", expectedStatus: [400, 404] },
  { value: "1#", description: "Символ #", expectedStatus: [400, 404] },
  { value: "1$", description: "Символ $", expectedStatus: [400, 404] },
  { value: "1%", description: "Символ %", expectedStatus: [400, 404] },
  { value: "1&", description: "Символ &", expectedStatus: [400, 404] },
  { value: "1*", description: "Символ *", expectedStatus: [400, 404] },
  { value: "1+", description: "Символ +", expectedStatus: [400, 404] },
  { value: "1=", description: "Символ =", expectedStatus: [400, 404] },
  { value: "1?", description: "Символ ?", expectedStatus: [400, 404] },
  { value: "1!", description: "Символ !", expectedStatus: [400, 404] },
  { value: "1~", description: "Символ ~", expectedStatus: [400, 404] },
  { value: "1^", description: "Символ ^", expectedStatus: [400, 404] },
  { value: "1|", description: "Символ |", expectedStatus: [400, 404] },
  { value: "1\\", description: "Символ обратного слэша", expectedStatus: [400, 404] },
  { value: "1/", description: "Символ слэша", expectedStatus: [400, 404] },
  { value: "1<", description: "Символ <", expectedStatus: [400, 404] },
  { value: "1>", description: "Символ >", expectedStatus: [400, 404] },
  { value: "1[", description: "Символ [", expectedStatus: [400, 404] },
  { value: "1]", description: "Символ ]", expectedStatus: [400, 404] },
  { value: "1{", description: "Символ {", expectedStatus: [400, 404] },
  { value: "1}", description: "Символ }", expectedStatus: [400, 404] },
  { value: "1(", description: "Символ (", expectedStatus: [400, 404] },
  { value: "1)", description: "Символ )", expectedStatus: [400, 404] },
  { value: "1,", description: "Символ запятой", expectedStatus: [400, 404] },
  { value: "1.", description: "Символ точки", expectedStatus: [400, 404] },
  { value: "1;", description: "Символ точки с запятой", expectedStatus: [400, 404] },
  { value: "1:", description: "Символ двоеточия", expectedStatus: [400, 404] },
  { value: "1'", description: "Символ одинарной кавычки", expectedStatus: [400, 404] },
  { value: '1"', description: "Символ двойной кавычки", expectedStatus: [400, 404] },
  { value: "1`", description: "Символ обратной кавычки", expectedStatus: [400, 404] },
  { value: "1 ", description: "Строка с пробелом в конце", expectedStatus: [400, 404] },
  { value: " 1", description: "Строка с пробелом в начале", expectedStatus: [400, 404] },
  { value: "1\t", description: "Строка с табуляцией", expectedStatus: [400, 404] },
  { value: "1\n", description: "Строка с переводом строки", expectedStatus: [400, 404] },
  { value: "1\r", description: "Строка с возвратом каретки", expectedStatus: [400, 404] },
];

export const invalidSmartOrderIdVariations = [...boundaryAndInvalidSmartOrderIdVariations];
