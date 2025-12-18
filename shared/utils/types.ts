import { BANDWIDTH_ORDER_PERIODS, ENERGY_ORDER_PERIODS } from "./constants";

export type OrderResourceType = "ENERGY" | "BANDWIDTH" | "ACTIVATION";

export type EnergyOrderPeriodMs = (typeof ENERGY_ORDER_PERIODS)[number];
export type BandwidthOrderPeriodMs = (typeof BANDWIDTH_ORDER_PERIODS)[number];
export type ActivationOrderPeriod = null | 0;

export type OrderPeriodMs = EnergyOrderPeriodMs | BandwidthOrderPeriodMs | ActivationOrderPeriod;

export interface Order {
  id: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  status: "INIT" | "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  type: OrderResourceType;
  amount: number;
  period: OrderPeriodMs;
  targetAddress: string;
  provider?: string | null;
  externalId?: string | null;
  buyPrice?: number | string | null;
  sellPrice: number | string;
  profit?: number | string | null;
  blockchainTransaction?: string | null;
  description?: string | null;
  details?: any;
  silent: boolean;
  source: "BOT" | "API" | "WEB" | "AUTO_REFILL" | "SMART_REFILL";
  userId: string;
}

export const SMART_ORDER_STATUSES = [
  "INIT",
  "PENDING_ACTIVATION",
  "PENDING_RESOURCES",
  "COMPLETED",
  "FAILED",
] as const;

export type SmartOrderStatus = (typeof SMART_ORDER_STATUSES)[number];

export interface SmartOrder {
  id: number;
  fromAddress: string;
  toAddress: string;
  withActivation: boolean;
  withEnergy: boolean;
  withBandwidth: boolean;
  userId: string;
  status: SmartOrderStatus;
  details?: any;
}


export type SmartOrderWithOrders = Omit<SmartOrder, "userId"> & {
  userId?: string;
  orders: Order[];
};

export type CreateOrderRequest =
  | {
      type: "ENERGY";
      targetAddress: string;
      amount: number;
      period: EnergyOrderPeriodMs;
    }
  | {
      type: "BANDWIDTH";
      targetAddress: string;
      amount: number;
      period: BandwidthOrderPeriodMs;
    }
  | {
      type: "ACTIVATION";
      targetAddress: string;
    };

export interface CreateActivationOrderRequest {
  type: Extract<OrderResourceType, "ACTIVATION">;
  targetAddress: string;
}

export interface EnergyPriceValues {
  "1h": number;
  "1d": number;
  "3d": number;
  "7d": number;
  "14d": number;
}

export interface BandwidthPriceValues {
  "1h": number;
  "1d": number;
}
