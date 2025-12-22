export interface BandwidthPurchaseCombination {
  duration: "1h" | "1d";
  bandwidth: number;
  sunRate: number;
  expectedCost: number;
}

export const BANDWIDTH_PURCHASE_COMBINATIONS: BandwidthPurchaseCombination[] = [
  { duration: "1h", bandwidth: 1000, sunRate: 976, expectedCost: 1.271 },
  { duration: "1h", bandwidth: 1000, sunRate: 3104, expectedCost: 3.399 },
  { duration: "1h", bandwidth: 1000, sunRate: 13512, expectedCost: 13.807 },
  { duration: "1h", bandwidth: 50000, sunRate: 976, expectedCost: 63.55 },
  { duration: "1h", bandwidth: 50000, sunRate: 3104, expectedCost: 169.95 },
  { duration: "1h", bandwidth: 50000, sunRate: 13512, expectedCost: 690.35 },
  { duration: "1h", bandwidth: 110000, sunRate: 976, expectedCost: 139.81 },
  { duration: "1h", bandwidth: 110000, sunRate: 3104, expectedCost: 373.89 },
  { duration: "1h", bandwidth: 110000, sunRate: 13512, expectedCost: 1518.77 },

  { duration: "1d", bandwidth: 1000, sunRate: 976, expectedCost: 23.719 },
  { duration: "1d", bandwidth: 1000, sunRate: 3104, expectedCost: 74.791 },
  { duration: "1d", bandwidth: 1000, sunRate: 13512, expectedCost: 324.583 },
  { duration: "1d", bandwidth: 50000, sunRate: 976, expectedCost: 1200.295 },
  { duration: "1d", bandwidth: 50000, sunRate: 3104, expectedCost: 3725.095 },
  { duration: "1d", bandwidth: 50000, sunRate: 13512, expectedCost: 16214.695 },
  { duration: "1d", bandwidth: 110000, sunRate: 976, expectedCost: 2586.535 },
  { duration: "1d", bandwidth: 110000, sunRate: 3104, expectedCost: 8202.535 },
  { duration: "1d", bandwidth: 110000, sunRate: 13512, expectedCost: 35781.415 },
];
