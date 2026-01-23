import type { SmartOrderNoOrdersCombination } from "@shared/utils/types";

export const SMART_ORDER_NO_ORDERS_COMBINATIONS: SmartOrderNoOrdersCombination[] = [
  {
    description:
      "fromAddress активен, Energy ≥ 65K, Bandwidth ≥ 350; toAddress активен; все флаги = true",
    addressSetup: "FROM_WITH_RESOURCES_TO_ACTIVATED",
    withActivation: true,
    withEnergy: true,
    withBandwidth: true,
    energyAmount: 65000,
    lowEnergy: false,
    lowBandwidth: false,
  },
  {
    description:
      "fromAddress активен, Energy < 65K, Bandwidth < 350; toAddress активен; все флаги = false",
    addressSetup: "BOTH_ACTIVATED",
    withActivation: false,
    withEnergy: false,
    withBandwidth: false,
    lowEnergy: true,
    lowBandwidth: true,
  },
  {
    description:
      "fromAddress активен, Energy < 65K, Bandwidth < 350; toAddress активен; только withActivation=true",
    addressSetup: "BOTH_ACTIVATED",
    withActivation: true,
    withEnergy: false,
    withBandwidth: false,
    lowEnergy: true,
    lowBandwidth: true,
  },
  {
    description:
      "fromAddress активен, Energy ≥ 65K, Bandwidth < 350; toAddress активен; withActivation=true, withEnergy=true, withBandwidth=false",
    addressSetup: "FROM_WITH_RESOURCES_TO_ACTIVATED",
    withActivation: true,
    withEnergy: true,
    withBandwidth: false,
    energyAmount: 65000,
    lowEnergy: false,
    lowBandwidth: true,
  },
  {
    description:
      "fromAddress активен, Energy < 65K, Bandwidth ≥ 350; toAddress активен; withActivation=true, withBandwidth=true",
    addressSetup: "BOTH_ACTIVATED",
    withActivation: true,
    withEnergy: false,
    withBandwidth: true,
    lowEnergy: true,
    lowBandwidth: false,
  },
  {
    description:
      "fromAddress активен, Energy ≥ 65K, Bandwidth ≥ 350; toAddress активен; withEnergy=true, withBandwidth=true",
    addressSetup: "FROM_WITH_RESOURCES_TO_ACTIVATED",
    withActivation: false,
    withEnergy: true,
    withBandwidth: true,
    energyAmount: 65000,
    lowEnergy: false,
    lowBandwidth: false,
  },
  {
    description:
      "fromAddress активен, Energy ≥ 65K, Bandwidth < 350; toAddress активен; все флаги = false",
    addressSetup: "FROM_WITH_RESOURCES_TO_ACTIVATED",
    withActivation: false,
    withEnergy: false,
    withBandwidth: false,
    energyAmount: 65000,
    lowEnergy: false,
    lowBandwidth: true,
  },
];
