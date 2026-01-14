import {
  BANDWIDTH_ORDER_PERIODS,
  ENERGY_ORDER_PERIODS,
  OrderStatus,
  OrderType,
  SmartOrderStatus,
  OrderSource,
} from "./constants";

export type OrderResourceType = OrderType;

export type EnergyOrderPeriodMs = (typeof ENERGY_ORDER_PERIODS)[number];
export type BandwidthOrderPeriodMs = (typeof BANDWIDTH_ORDER_PERIODS)[number];
export type ActivationOrderPeriod = null | 0;

export type OrderPeriodMs = EnergyOrderPeriodMs | BandwidthOrderPeriodMs | ActivationOrderPeriod;

export interface Order {
  id: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  status: OrderStatus;
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
  source: OrderSource;
  userId: string;
}

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

export interface EnergyPurchaseCombination {
  duration: "1h" | "1d" | "3d";
  energy: number;
  sunRate: number;
  expectedCost?: number;
}

export interface BandwidthPurchaseCombination {
  duration: "1h" | "1d";
  bandwidth: number;
  sunRate: number;
  expectedCost: number;
}

export interface CreateOrderRequestVariation {
  data: any;
  description: string;
  expectedStatus?: number;
}

export interface OrderListParamVariation {
  params: { offset?: any; limit?: any };
  description: string;
}

export interface CreateUserRequest {
  profile: {
    firstName: string;
    tgId: string;
    tgUsername: string;
  };
}

export interface CreateUserResponse {
  id: string;
}

export interface GetAccessTokenResponse {
  token: string;
}

export interface ProviderAvailabilityConfig {
  ENERGY?: boolean | string[];
  BANDWIDTH?: boolean | string[];
  ACTIVATION?: boolean;
}

export interface Provider {
  name: string;
  link?: string;
  availabilityConfig: ProviderAvailabilityConfig;
  last1hEnergyPrice?: number | null;
}

export type ProviderSettings = Record<string, { priority: number }>;

export interface ProviderPriorityWithOrderCombination {
  priorityDescription: string;
  priorities: {
    "TronLocal-1": number;
    "TronLocal-2": number;
    "TronLocal-3": number;
    TronLocal: number;
  };
  orderCombination: {
    duration: "1h" | "1d" | "3d";
    energy: number;
    sunRate: number;
    expectedCost: number;
  };
}

export interface SmartOrderNoOrdersCombination {
  description: string;
  addressSetup: "FROM_WITH_RESOURCES_TO_ACTIVATED" | "BOTH_ACTIVATED";
  withActivation: boolean;
  withEnergy: boolean;
  withBandwidth: boolean;
  energyAmount?: number;
  lowEnergy?: boolean;
  lowBandwidth?: boolean;
}

export interface SmartOrderWithOrdersCombination {
  description: string;
  addressSetup: "BOTH_ACTIVATED" | "FROM_WITH_RESOURCES_TO_ACTIVATED";
  withActivation: boolean;
  withEnergy: boolean;
  withBandwidth: boolean;
  energyAmount?: number;
  expectedOrderTypes: ("ACTIVATION" | "ENERGY" | "BANDWIDTH")[];
  expectedEnergyAmount?: number;
  expectedBandwidthAmount?: number;
  lowEnergy?: boolean;
  lowBandwidth?: boolean;
}

export interface FromUnauthToAuthCombination {
  description: string;
  withActivation: boolean;
  withEnergy: boolean;
  withBandwidth: boolean;
}
