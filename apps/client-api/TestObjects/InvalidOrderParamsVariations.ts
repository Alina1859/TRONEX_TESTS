import {
  ORDER_LIST_MAX_LIMIT,
  ORDER_LIST_MIN_LIMIT,
  ORDER_LIST_MIN_OFFSET,
} from "../../../shared/utils/constants";

type OrderListParamVariation = {
  params: { offset?: any; limit?: any };
  description: string;
};

export const invalidOffsetVariations: OrderListParamVariation[] = [
  {
    params: { offset: ORDER_LIST_MIN_OFFSET - 1 },
    description: `offset меньше минимального (${ORDER_LIST_MIN_OFFSET - 1})`,
  },
  { params: { offset: -10 }, description: "offset сильно отрицательный (-10)" },
  { params: { offset: 1.5 }, description: "offset дробный (1.5)" },
  { params: { offset: "10a" }, description: 'offset строка "10a"' },
  { params: { offset: "abc" }, description: 'offset строка "abc"' },
  { params: { offset: null }, description: "offset null" },
  { params: { offset: "undefined" }, description: "offset undefined" },
  { params: { offset: Number.NaN }, description: "offset NaN" },
  { params: { offset: Number.POSITIVE_INFINITY }, description: "offset Infinity" },
  { params: { offset: {} }, description: "offset объект {}" },
];

export const invalidLimitVariations: OrderListParamVariation[] = [
  {
    params: { limit: ORDER_LIST_MIN_LIMIT - 1 },
    description: `limit меньше минимального (${ORDER_LIST_MIN_LIMIT - 1})`,
  },
  { params: { limit: 0 }, description: "limit равен 0" },
  { params: { limit: -10 }, description: "limit сильно отрицательный (-10)" },
  { params: { limit: 0.5 }, description: "limit дробный (0.5)" },
  {
    params: { limit: ORDER_LIST_MAX_LIMIT + 1 },
    description: `limit больше максимального (${ORDER_LIST_MAX_LIMIT + 1})`,
  },
  {
    params: { limit: ORDER_LIST_MAX_LIMIT + 1000 },
    description: `limit сильно больше максимального (${ORDER_LIST_MAX_LIMIT + 1000})`,
  },
  { params: { limit: "10a" }, description: 'limit строка "10a"' },
  { params: { limit: "abc" }, description: 'limit строка "abc"' },
  { params: { limit: null }, description: "limit null" },
  { params: { limit: "undefined" }, description: "limit undefined" },
  { params: { limit: Number.NaN }, description: "limit NaN" },
  { params: { limit: Number.POSITIVE_INFINITY }, description: "limit Infinity" },
  { params: { limit: {} }, description: "limit объект {}" },
  { params: { limit: [] }, description: "limit массив []" },
];

export const invalidOffsetLimitCombinations: OrderListParamVariation[] = [
  { params: { offset: ORDER_LIST_MIN_OFFSET - 1, limit: ORDER_LIST_MAX_LIMIT + 1 }, description: "offset меньше минимума, limit больше максимума" },
  { params: { offset: -5, limit: -1 }, description: "offset и limit отрицательные" },
  { params: { offset: 1.2, limit: 0.5 }, description: "offset дробный, limit дробный" },
  { params: { offset: "abc", limit: "xyz" }, description: "offset и limit строковые нечисловые" },
  { params: { offset: "undefined", limit: "undefined" }, description: "offset undefined, limit undefined" },
  { params: { offset: Number.NaN, limit: Number.NaN }, description: "offset NaN, limit NaN" },
  { params: { offset: {}, limit: {} }, description: "offset объект, limit объект" },
  { params: { offset: "[]", limit: "[]" }, description: 'offset "[]", limit "[]"' },
  { params: { offset: ORDER_LIST_MIN_OFFSET - 1, limit: "abc" }, description: "offset меньше минимума, limit строка" },
  { params: { offset: "abc", limit: ORDER_LIST_MAX_LIMIT + 1000 }, description: "offset строка, limit сильно больше максимума" },
];

