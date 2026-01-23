import type { SmartOrderWithOrdersCombination } from "@shared/utils/types";

export const SMART_ORDER_WITH_ORDERS_COMBINATIONS: SmartOrderWithOrdersCombination[] = [
  {
    description:
      "fromAddress активен, Energy < 65K, Bandwidth ≥ 350; toAddress активен; withActivation=true, withEnergy=true, withBandwidth=true; ожидается ENERGY order",
    addressSetup: "BOTH_ACTIVATED",
    withActivation: true,
    withEnergy: true,
    withBandwidth: true,
    expectedOrderTypes: ["ENERGY"],
    expectedEnergyAmount: 65000,
    lowEnergy: true,
    lowBandwidth: false,
  },
  {
    description:
      "fromAddress активен, Energy < 65K, Bandwidth ≥ 350; toAddress активен; withActivation=false, withEnergy=true, withBandwidth=false; ожидается ENERGY order",
    addressSetup: "BOTH_ACTIVATED",
    withActivation: false,
    withEnergy: true,
    withBandwidth: false,
    expectedOrderTypes: ["ENERGY"],
    expectedEnergyAmount: 65000,
    lowEnergy: true,
    lowBandwidth: false,
  },
  {
    description:
      "fromAddress активен, Energy ≥ 65K, Bandwidth < 350; toAddress активен; withActivation=true, withEnergy=false, withBandwidth=true; ожидается BANDWIDTH order",
    addressSetup: "FROM_WITH_RESOURCES_TO_ACTIVATED",
    withActivation: true,
    withEnergy: false,
    withBandwidth: true,
    energyAmount: 65000,
    expectedOrderTypes: ["BANDWIDTH"],
    expectedBandwidthAmount: 1000,
    lowEnergy: false,
    lowBandwidth: true,
  },
  {
    description:
      "fromAddress активен, Energy ≥ 65K, Bandwidth < 350; toAddress активен; withActivation=false, withEnergy=false, withBandwidth=true; ожидается BANDWIDTH order",
    addressSetup: "FROM_WITH_RESOURCES_TO_ACTIVATED",
    withActivation: false,
    withEnergy: false,
    withBandwidth: true,
    energyAmount: 65000,
    expectedOrderTypes: ["BANDWIDTH"],
    expectedBandwidthAmount: 1000,
    lowEnergy: false,
    lowBandwidth: true,
  },
  {
    description:
      "fromAddress активен, Energy < 65K, Bandwidth ≥ 350; toAddress активен; withActivation=true, withEnergy=true, withBandwidth=false; ожидается ENERGY order",
    addressSetup: "BOTH_ACTIVATED",
    withActivation: true,
    withEnergy: true,
    withBandwidth: false,
    expectedOrderTypes: ["ENERGY"],
    expectedEnergyAmount: 65000,
    lowEnergy: true,
    lowBandwidth: false,
  },
];
