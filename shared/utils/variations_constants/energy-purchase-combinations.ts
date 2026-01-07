import { EnergyPurchaseCombination } from "../types";
import { ENERGY_PRICE_FORMULA } from "../constants";

export const ENERGY_PURCHASE_COMBINATIONS: EnergyPurchaseCombination[] = [
  { duration: "1h", energy: 65000, sunRate: 70, expectedCost: 4.55 },
  { duration: "1h", energy: 65000, sunRate: 127, expectedCost: 8.255 },
  { duration: "1h", energy: 65000, sunRate: 210, expectedCost: 13.65 },
  { duration: "1h", energy: 500000, sunRate: 70, expectedCost: 35 },
  { duration: "1h", energy: 500000, sunRate: 127, expectedCost: 63.5 },
  { duration: "1h", energy: 500000, sunRate: 210, expectedCost: 105 },
  // { duration: "1h", energy: 1000000, sunRate: 70, expectedCost: 70 },
  // { duration: "1h", energy: 1000000, sunRate: 127, expectedCost: 127 },
  // { duration: "1h", energy: 1000000, sunRate: 210, expectedCost: 210 },

  { duration: "1d", energy: 65000, sunRate: 70, expectedCost: 4.55 },
  { duration: "1d", energy: 65000, sunRate: 127, expectedCost: 8.255 },
  { duration: "1d", energy: 65000, sunRate: 210, expectedCost: 13.65 },
  { duration: "1d", energy: 500000, sunRate: 70, expectedCost: 35 },
  { duration: "1d", energy: 500000, sunRate: 127, expectedCost: 63.5 },
  { duration: "1d", energy: 500000, sunRate: 210, expectedCost: 105 },
  // { duration: "1d", energy: 1000000, sunRate: 70, expectedCost: 70 },
  // { duration: "1d", energy: 1000000, sunRate: 127, expectedCost: 127 },
  // { duration: "1d", energy: 1000000, sunRate: 210, expectedCost: 210 },

  { duration: "3d", energy: 65000, sunRate: 70, expectedCost: 13.65 },
  { duration: "3d", energy: 65000, sunRate: 127, expectedCost: 24.765 },
  { duration: "3d", energy: 65000, sunRate: 210, expectedCost: 40.95 },
  { duration: "3d", energy: 500000, sunRate: 70, expectedCost: 105 },
  { duration: "3d", energy: 500000, sunRate: 127, expectedCost: 190.5 },
  { duration: "3d", energy: 500000, sunRate: 210, expectedCost: 315 },
  // { duration: "3d", energy: 1000000, sunRate: 70, expectedCost: 210 },
  // { duration: "3d", energy: 1000000, sunRate: 127, expectedCost: 381 },
  // { duration: "3d", energy: 1000000, sunRate: 210, expectedCost: 630 },
];
