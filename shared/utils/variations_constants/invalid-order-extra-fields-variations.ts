import {
  BANDWIDTH_AMOUNT_DEFAULT,
  ENERGY_AMOUNT_DEFAULT,
  OrderPeriod,
  TEST_USER_ID_UUID,
} from "@shared/utils/constants";
import { CreateOrderRequestVariation } from "@shared/utils/types";
import { validTargetAddress } from "./invalid-create-order-request-variations";

export const invalidOrderExtraFieldsVariations: CreateOrderRequestVariation[] = [
  {
    data: {
      type: "ACTIVATION",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
    },
    description: "ACTIVATION: лишнее поле amount",
  },
  {
    data: {
      type: "ACTIVATION",
      targetAddress: validTargetAddress,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "ACTIVATION: лишнее поле period",
  },
  {
    data: {
      type: "ACTIVATION",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
    },
    description: "ACTIVATION: лишние поля amount+period",
  },

  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      id: 1,
    },
    description: "ENERGY: лишнее поле id",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      status: "INIT",
    },
    description: "ENERGY: лишнее поле status",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      createdAt: new Date().toISOString(),
    },
    description: "ENERGY: лишнее поле createdAt",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      updatedAt: new Date().toISOString(),
    },
    description: "ENERGY: лишнее поле updatedAt",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      userId: TEST_USER_ID_UUID,
    },
    description: "ENERGY: лишнее поле userId",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      provider: "test-provider",
    },
    description: "ENERGY: лишнее поле provider",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      externalId: "external-123",
    },
    description: "ENERGY: лишнее поле externalId",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      buyPrice: 100,
    },
    description: "ENERGY: лишнее поле buyPrice",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      sellPrice: 150,
    },
    description: "ENERGY: лишнее поле sellPrice",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      profit: 50,
    },
    description: "ENERGY: лишнее поле profit",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      blockchainTransaction: "0x1234567890abcdef",
    },
    description: "ENERGY: лишнее поле blockchainTransaction",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      description: "Test description",
    },
    description: "ENERGY: лишнее поле description",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      details: { test: "data" },
    },
    description: "ENERGY: лишнее поле details",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      silent: true,
    },
    description: "ENERGY: лишнее поле silent",
  },
  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      source: "API",
    },
    description: "ENERGY: лишнее поле source",
  },

  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      id: 1,
    },
    description: "BANDWIDTH: лишнее поле id",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      status: "INIT",
    },
    description: "BANDWIDTH: лишнее поле status",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      userId: TEST_USER_ID_UUID,
    },
    description: "BANDWIDTH: лишнее поле userId",
  },
  {
    data: {
      type: "BANDWIDTH",
      targetAddress: validTargetAddress,
      amount: BANDWIDTH_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      blockchainTransaction: "0x1234567890abcdef",
    },
    description: "BANDWIDTH: лишнее поле blockchainTransaction",
  },

  {
    data: {
      type: "ACTIVATION",
      targetAddress: validTargetAddress,
      id: 1,
    },
    description: "ACTIVATION: лишнее поле id",
  },
  {
    data: {
      type: "ACTIVATION",
      targetAddress: validTargetAddress,
      status: "INIT",
    },
    description: "ACTIVATION: лишнее поле status",
  },
  {
    data: {
      type: "ACTIVATION",
      targetAddress: validTargetAddress,
      userId: TEST_USER_ID_UUID,
    },
    description: "ACTIVATION: лишнее поле userId",
  },
  {
    data: {
      type: "ACTIVATION",
      targetAddress: validTargetAddress,
      blockchainTransaction: "0x1234567890abcdef",
    },
    description: "ACTIVATION: лишнее поле blockchainTransaction",
  },

  {
    data: {
      type: "ENERGY",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      id: 1,
      status: "INIT",
      userId: TEST_USER_ID_UUID,
    },
    description: "ENERGY: лишние поля id, status и userId",
  },
  {
    data: {
      type: "ACTIVATION",
      targetAddress: validTargetAddress,
      amount: ENERGY_AMOUNT_DEFAULT,
      period: OrderPeriod.ONE_HOUR,
      id: 1,
      status: "INIT",
    },
    description: "ACTIVATION: лишние поля amount, period, id и status",
  },
];
