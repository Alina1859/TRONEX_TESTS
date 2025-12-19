export interface BandwidthPurchaseCombination {
  duration: "1h" | "1d";
  bandwidth: number;
  sunRate: number;
  expectedCost: number;
}

export const BANDWIDTH_PURCHASE_COMBINATIONS: BandwidthPurchaseCombination[] = [
  { duration: "1h", bandwidth: 1000, sunRate: 976, expectedCost: 1.27 },
  { duration: "1h", bandwidth: 1000, sunRate: 3104, expectedCost: 4.04 },
  { duration: "1h", bandwidth: 1000, sunRate: 13512, expectedCost: 17.6 },
  { duration: "1h", bandwidth: 50000, sunRate: 976, expectedCost: 63.5 },
  { duration: "1h", bandwidth: 50000, sunRate: 3104, expectedCost: 202.1 },
  { duration: "1h", bandwidth: 50000, sunRate: 13512, expectedCost: 879.9 },
  { duration: "1h", bandwidth: 110000, sunRate: 976, expectedCost: 139.7 },
  { duration: "1h", bandwidth: 110000, sunRate: 3104, expectedCost: 444.62 },
  { duration: "1h", bandwidth: 110000, sunRate: 13512, expectedCost: 1937.78 },

  { duration: "1d", bandwidth: 1000, sunRate: 976, expectedCost: 0.976 },
  { duration: "1d", bandwidth: 1000, sunRate: 3104, expectedCost: 3.104 },
  { duration: "1d", bandwidth: 1000, sunRate: 13512, expectedCost: 13.512 },
  { duration: "1d", bandwidth: 50000, sunRate: 976, expectedCost: 48.8 },
  { duration: "1d", bandwidth: 50000, sunRate: 3104, expectedCost: 155.2 },
  { duration: "1d", bandwidth: 50000, sunRate: 13512, expectedCost: 675.6 },
  { duration: "1d", bandwidth: 110000, sunRate: 976, expectedCost: 107.36 },
  { duration: "1d", bandwidth: 110000, sunRate: 3104, expectedCost: 341.44 },
  { duration: "1d", bandwidth: 110000, sunRate: 13512, expectedCost: 1486.32 },
];
