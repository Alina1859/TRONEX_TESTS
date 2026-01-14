import { expect } from "@playwright/test";
import { CoreRepository } from "@apps/client-api/api/core.api";
import {
  Order,
  EnergyPriceValues,
  EnergyOrderPeriodMs,
  BandwidthPriceValues,
  BandwidthOrderPeriodMs,
} from "@shared/utils/types";
import {
  ENERGY_PRICE_FORMULA,
  BANDWIDTH_PRICE_FORMULA,
  OrderPeriod,
  PRICE_TOLERANCE,
} from "@shared/utils/constants";
import { getPeriodKey } from "@shared/helpers/order-period-helpers";
import { log } from "@shared/utils/logger";

type PeriodHoursAndDays = { hour: number; day: number };

const ENERGY_PERIOD_MAP: Record<EnergyOrderPeriodMs, PeriodHoursAndDays> = {
  [OrderPeriod.ONE_HOUR]: { hour: 1, day: 0 },
  [OrderPeriod.ONE_DAY]: { hour: 0, day: 1 },
  [OrderPeriod.THREE_DAYS]: { hour: 0, day: 3 },
};

const BANDWIDTH_PERIOD_MAP: Record<BandwidthOrderPeriodMs, PeriodHoursAndDays> = {
  [OrderPeriod.ONE_HOUR]: { hour: 1, day: 0 },
  [OrderPeriod.ONE_DAY]: { hour: 0, day: 1 },
};

export class PriceCheck {
  constructor(
    private coreRepo: CoreRepository,
    private order: Order
  ) {}

  private getOrderPrice(): number {
    return typeof this.order.sellPrice === "string"
      ? parseFloat(this.order.sellPrice)
      : this.order.sellPrice;
  }

  private async getEnergyPriceForPeriod(period: EnergyOrderPeriodMs): Promise<number> {
    const priceEnergyResponse = await this.coreRepo.coreConstantsKeyGet({ key: "PRICE_ENERGY" });
    const priceEnergy: EnergyPriceValues = priceEnergyResponse.data;
    const periodKey = getPeriodKey(period);
    return priceEnergy[periodKey];
  }

  private async getBandwidthPriceForPeriod(period: BandwidthOrderPeriodMs): Promise<number> {
    const priceBandwidthResponse = await this.coreRepo.coreConstantsKeyGet({
      key: "PRICE_BANDWIDTH",
    });
    const priceBandwidth: BandwidthPriceValues = priceBandwidthResponse.data;
    const periodKey = getPeriodKey(period) as "1h" | "1d";
    return priceBandwidth[periodKey];
  }

  private periodToHoursAndDays(period: EnergyOrderPeriodMs): PeriodHoursAndDays {
    const result = ENERGY_PERIOD_MAP[period];
    if (!result) {
      throw new Error(`Неподдерживаемый период для энергии: ${period}`);
    }
    return result;
  }

  private bandwidthPeriodToHoursAndDays(period: BandwidthOrderPeriodMs): PeriodHoursAndDays {
    const result = BANDWIDTH_PERIOD_MAP[period];
    if (!result) {
      throw new Error(`Неподдерживаемый период для полосы пропускания: ${period}`);
    }
    return result;
  }

  async calculateExpectedEnergyPrice(params: {
    period: EnergyOrderPeriodMs;
    energyAmount: number;
    sunRate?: number;
  }): Promise<number> {
    const { period, energyAmount, sunRate } = params;
    const actualSunRate =
      sunRate !== undefined ? sunRate : await this.getEnergyPriceForPeriod(period);
    const { hour, day } = this.periodToHoursAndDays(period);
    return ENERGY_PRICE_FORMULA(actualSunRate, hour, day, energyAmount);
  }

  async checkEnergyOrderPriceByFormula(params: {
    period: EnergyOrderPeriodMs;
    energyAmount: number;
    tolerance?: number;
    sunRate?: number;
  }): Promise<void> {
    const { period, energyAmount, tolerance = PRICE_TOLERANCE, sunRate } = params;
    const expectedPrice = await this.calculateExpectedEnergyPrice({
      period,
      energyAmount,
      sunRate,
    });
    const actualPrice = this.getOrderPrice();

    log.info(
      `Проверка цены энергии: ожидаемая (по формуле) = ${expectedPrice}, фактическая (API) = ${actualPrice}${sunRate !== undefined ? `, sunRate = ${sunRate}` : ""}`
    );

    this.checkPriceDifference(
      actualPrice,
      expectedPrice,
      tolerance,
      `Стоимость заказа энергии ${actualPrice} не совпадает с расчетной по формуле ${expectedPrice}`
    );
  }

  async calculateExpectedBandwidthPrice(params: {
    period: BandwidthOrderPeriodMs;
    bandwidthAmount: number;
  }): Promise<number> {
    const { period, bandwidthAmount } = params;
    const sunRate = await this.getBandwidthPriceForPeriod(period);
    const { hour, day } = this.bandwidthPeriodToHoursAndDays(period);
    return BANDWIDTH_PRICE_FORMULA(sunRate, hour, day, bandwidthAmount);
  }

  async checkBandwidthOrderPriceByFormula(params: {
    period: BandwidthOrderPeriodMs;
    bandwidthAmount: number;
    tolerance?: number;
  }): Promise<void> {
    const { period, bandwidthAmount, tolerance = PRICE_TOLERANCE } = params;
    const expectedPrice = await this.calculateExpectedBandwidthPrice({ period, bandwidthAmount });
    const actualPrice = this.getOrderPrice();

    log.info(
      `Проверка цены полосы пропускания: ожидаемая (по формуле) = ${expectedPrice}, фактическая (API) = ${actualPrice}`
    );

    this.checkPriceDifference(
      actualPrice,
      expectedPrice,
      tolerance,
      `Стоимость заказа полосы пропускания ${actualPrice} не совпадает с расчетной по формуле ${expectedPrice}`
    );
  }

  private checkPriceDifference(
    actualPrice: number,
    expectedPrice: number,
    tolerance: number,
    baseMessage: string
  ): void {
    const priceDifference = Math.abs(actualPrice - expectedPrice);
    expect(priceDifference, `${baseMessage} (разница: ${priceDifference})`).toBeLessThanOrEqual(
      tolerance
    );
  }

  checkOrderCost(params: { expectedCost: number; tolerance?: number; message?: string }): void {
    const { expectedCost, tolerance = PRICE_TOLERANCE, message } = params;
    const actualCost = this.getOrderPrice();
    const costDifference = Math.abs(actualCost - expectedCost);
    const errorMessage =
      message ||
      `Стоимость заказа ${actualCost} не совпадает с ожидаемой ${expectedCost} (разница: ${costDifference})`;
    expect(costDifference, errorMessage).toBeLessThanOrEqual(tolerance);
  }
}
