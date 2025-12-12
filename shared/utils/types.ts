import { BANDWIDTH_ORDER_PERIODS, ENERGY_ORDER_PERIODS } from "./constants";

export type OrderResourceType = "ENERGY" | "BANDWIDTH" | "ACTIVATION";

export type EnergyOrderPeriodMs = (typeof ENERGY_ORDER_PERIODS)[number];
export type BandwidthOrderPeriodMs = (typeof BANDWIDTH_ORDER_PERIODS)[number];
export type OrderPeriodMs = EnergyOrderPeriodMs | BandwidthOrderPeriodMs;

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
    };

export interface CreateActivationOrderRequest {
  type: Extract<OrderResourceType, "ACTIVATION">;
  targetAddress: string;
}
