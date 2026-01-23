import { BandwidthPurchaseCombination } from "../types";

export const BANDWIDTH_PURCHASE_COMBINATIONS: BandwidthPurchaseCombination[] = [
  { duration: "1h", bandwidth: 1000, sunRate: 976, expectedCost: 1.27 },
  { duration: "1h", bandwidth: 1000, sunRate: 3104, expectedCost: 3.4 },
  { duration: "1h", bandwidth: 1000, sunRate: 13512, expectedCost: 13.81 },
  { duration: "1h", bandwidth: 50000, sunRate: 976, expectedCost: 63.55 },
  { duration: "1h", bandwidth: 50000, sunRate: 3104, expectedCost: 169.95 },
  { duration: "1h", bandwidth: 50000, sunRate: 13512, expectedCost: 690.35 },
  // { duration: "1h", bandwidth: 100000, sunRate: 976, expectedCost: 127.1 },
  // { duration: "1h", bandwidth: 100000, sunRate: 3104, expectedCost: 339.9 },
  // { duration: "1h", bandwidth: 100000, sunRate: 13512, expectedCost: 1380.7 },

  { duration: "1d", bandwidth: 1000, sunRate: 976, expectedCost: 23.72 },
  { duration: "1d", bandwidth: 1000, sunRate: 3104, expectedCost: 74.79 },
  { duration: "1d", bandwidth: 1000, sunRate: 13512, expectedCost: 324.58 },
  { duration: "1d", bandwidth: 50000, sunRate: 976, expectedCost: 1200.3 },
  { duration: "1d", bandwidth: 50000, sunRate: 3104, expectedCost: 3725.1 },
  { duration: "1d", bandwidth: 50000, sunRate: 13512, expectedCost: 16214.7 },
  // { duration: "1d", bandwidth: 100000, sunRate: 976, expectedCost: 2342.70 },
  // { duration: "1d", bandwidth: 100000, sunRate: 3104, expectedCost: 7449.90 },
  // { duration: "1d", bandwidth: 100000, sunRate: 13512, expectedCost: 32429.10 },
];
