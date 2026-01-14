import { OrderPeriod } from "@shared/utils/constants";
import { BandwidthOrderPeriodMs, EnergyOrderPeriodMs } from "@shared/utils/types";

export const getPeriodKey = (period: OrderPeriod): "1h" | "1d" | "3d" => {
  if (period === OrderPeriod.ONE_HOUR) return "1h";
  if (period === OrderPeriod.ONE_DAY) return "1d";
  if (period === OrderPeriod.THREE_DAYS) return "3d";
  throw new Error(`Unsupported period: ${period}`);
};

export const getFormulaParams = (period: OrderPeriod): { hour: number; day: number } => {
  if (period === OrderPeriod.ONE_HOUR) return { hour: 1, day: 0 };
  if (period === OrderPeriod.ONE_DAY) return { hour: 0, day: 1 };
  if (period === OrderPeriod.THREE_DAYS) return { hour: 0, day: 3 };
  throw new Error(`Unsupported period: ${period}`);
};

export const parseEnergyDuration = (duration: "1h" | "1d" | "3d"): EnergyOrderPeriodMs => {
  if (duration === "1h") return OrderPeriod.ONE_HOUR as EnergyOrderPeriodMs;
  if (duration === "1d") return OrderPeriod.ONE_DAY as EnergyOrderPeriodMs;
  if (duration === "3d") return OrderPeriod.THREE_DAYS as EnergyOrderPeriodMs;
  throw new Error(`Unsupported energy duration: ${duration}`);
};

export const parseBandwidthDuration = (duration: "1h" | "1d"): BandwidthOrderPeriodMs => {
  if (duration === "1h") return OrderPeriod.ONE_HOUR as BandwidthOrderPeriodMs;
  if (duration === "1d") return OrderPeriod.ONE_DAY as BandwidthOrderPeriodMs;
  throw new Error(`Unsupported bandwidth duration: ${duration}`);
};
