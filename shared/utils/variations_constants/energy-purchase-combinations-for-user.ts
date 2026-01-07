import { EnergyPurchaseCombination } from "../types";

export const ENERGY_PURCHASE_COMBINATIONS_FOR_USER: EnergyPurchaseCombination[] = [
  { duration: "1h", energy: 65000, sunRate: 37, expectedCost: 2.405 },
  { duration: "1h", energy: 65000, sunRate: 211, expectedCost: 13.715 },
  { duration: "1h", energy: 65001, sunRate: 50, expectedCost: 3.25005 },
  { duration: "1h", energy: 65001, sunRate: 65, expectedCost: 4.225065 },
  { duration: "1h", energy: 500000, sunRate: 122, expectedCost: 61 },
  { duration: "1h", energy: 110000, sunRate: 37, expectedCost: 4.07 },
  { duration: "1h", energy: 110000, sunRate: 211, expectedCost: 23.21 },

  { duration: "1d", energy: 65000, sunRate: 50, expectedCost: 3.25 },
  { duration: "1d", energy: 65000, sunRate: 122, expectedCost: 7.93 },
  { duration: "1d", energy: 65001, sunRate: 122, expectedCost: 7.930122 },
  { duration: "1d", energy: 500000, sunRate: 75, expectedCost: 37.5 },
  { duration: "1d", energy: 500000, sunRate: 65, expectedCost: 32.5 },
  { duration: "1d", energy: 110000, sunRate: 65, expectedCost: 7.15 },

  { duration: "3d", energy: 65000, sunRate: 65, expectedCost: 12.675 },
  { duration: "3d", energy: 65001, sunRate: 75, expectedCost: 14.625225 },
  { duration: "3d", energy: 65001, sunRate: 211, expectedCost: 41.145633 },
  { duration: "3d", energy: 500000, sunRate: 211, expectedCost: 316.5 },
  { duration: "3d", energy: 110000, sunRate: 50, expectedCost: 16.5 },
  { duration: "3d", energy: 110000, sunRate: 122, expectedCost: 40.26 },
];


