import { CreateOrderRequestVariation } from "@shared/utils/types";
import { TEST_USER_ID_UUID } from "@shared/utils/constants";
import { validFromAddress, validToAddress } from "./invalid-create-smart-order-request-variations";

const validSmartOrderBaseRequest = {
  fromAddress: validFromAddress,
  toAddress: validToAddress,
  withActivation: true,
  withEnergy: true,
  withBandwidth: true,
};

export const invalidSmartOrderExtraFieldsVariations: CreateOrderRequestVariation[] = [
  // Лишние поля из order запроса
  {
    data: {
      ...validSmartOrderBaseRequest,
      type: "ENERGY",
    },
    description: "лишнее поле type",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      targetAddress: validToAddress,
    },
    description: "лишнее поле targetAddress",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      amount: 65000,
    },
    description: "лишнее поле amount",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      period: 3600000,
    },
    description: "лишнее поле period",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      type: "ENERGY",
      targetAddress: validToAddress,
    },
    description: "лишние поля type и targetAddress",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      amount: 65000,
      period: 3600000,
    },
    description: "лишние поля amount и period",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      type: "ENERGY",
      amount: 65000,
      period: 3600000,
      targetAddress: validToAddress,
    },
    description: "лишние поля type, amount, period и targetAddress",
  },

  // Поля из ответа, которые не должны быть в запросе
  {
    data: {
      ...validSmartOrderBaseRequest,
      id: 1,
    },
    description: "лишнее поле id",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      status: "INIT",
    },
    description: "лишнее поле status",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      userId: TEST_USER_ID_UUID,
    },
    description: "лишнее поле userId",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      createdAt: new Date().toISOString(),
    },
    description: "лишнее поле createdAt",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      updatedAt: new Date().toISOString(),
    },
    description: "лишнее поле updatedAt",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      details: { test: "data" },
    },
    description: "лишнее поле details",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      orders: [],
    },
    description: "лишнее поле orders",
  },

  // Комбинации лишних полей
  {
    data: {
      ...validSmartOrderBaseRequest,
      id: 1,
      status: "INIT",
      userId: TEST_USER_ID_UUID,
    },
    description: "лишние поля id, status и userId",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      type: "ENERGY",
      id: 1,
      status: "INIT",
    },
    description: "лишние поля type, id и status",
  },
  {
    data: {
      ...validSmartOrderBaseRequest,
      type: "ENERGY",
      amount: 65000,
      period: 3600000,
      targetAddress: validToAddress,
      id: 1,
      status: "INIT",
      userId: TEST_USER_ID_UUID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    description: "множество лишних полей (все поля из order + поля из ответа)",
  },
];
