import { expect } from "@playwright/test";
import { CoreRepository } from "@apps/client-api/api/core.api";
import {
  Order,
  EnergyPriceValues,
  EnergyOrderPeriodMs,
  BandwidthPriceValues,
  BandwidthOrderPeriodMs,
} from "../../../shared/utils/types";
import { ENERGY_PRICE_FORMULA, BANDWIDTH_PRICE_FORMULA, OrderPeriod } from "../../../shared/utils/constants";
import { log } from "../../../shared/utils/logger";


export async function getEnergyPriceForPeriod(
  coreRepo: CoreRepository,
  period: EnergyOrderPeriodMs
): Promise<number> {
  const priceEnergyResponse = await coreRepo.coreConstantsKeyGet("PRICE_ENERGY");
  const priceEnergy: EnergyPriceValues = priceEnergyResponse.data;

  if (period === OrderPeriod.ONE_HOUR) {
    return priceEnergy["1h"];
  } else if (period === OrderPeriod.ONE_DAY) {
    return priceEnergy["1d"];
  } else if (period === OrderPeriod.THREE_DAYS) {
    return priceEnergy["3d"];
  } else {
    throw new Error(`Неподдерживаемый период для энергии: ${period}`);
  }
}

function periodToHoursAndDays(period: EnergyOrderPeriodMs): { hour: number; day: number } {
  if (period === OrderPeriod.ONE_HOUR) {
    return { hour: 1, day: 0 };
  } else if (period === OrderPeriod.ONE_DAY) {
    return { hour: 0, day: 1 };
  } else if (period === OrderPeriod.THREE_DAYS) {
    return { hour: 0, day: 3 };
  } else {
    throw new Error(`Неподдерживаемый период: ${period}`);
  }
}

export async function calculateExpectedEnergyPrice(
  coreRepo: CoreRepository,
  period: EnergyOrderPeriodMs,
  energyAmount: number,
  sunRate?: number
): Promise<number> {
  const actualSunRate = sunRate !== undefined ? sunRate : await getEnergyPriceForPeriod(coreRepo, period);
  const { hour, day } = periodToHoursAndDays(period);
  return ENERGY_PRICE_FORMULA(actualSunRate, hour, day, energyAmount);
}

export async function validateEnergyOrderPriceByFormula(
  order: Order,
  coreRepo: CoreRepository,
  period: EnergyOrderPeriodMs,
  energyAmount: number,
  tolerance = 0.01,
  sunRate?: number
): Promise<void> {
  const expectedPrice = await calculateExpectedEnergyPrice(coreRepo, period, energyAmount, sunRate);
  const actualPrice = typeof order.sellPrice === "string" ? parseFloat(order.sellPrice) : order.sellPrice;

  log.info(
    `Проверка цены энергии: ожидаемая (по формуле) = ${expectedPrice}, фактическая (API) = ${actualPrice}${sunRate !== undefined ? `, sunRate = ${sunRate}` : ""}`
  );

  const priceDifference = Math.abs(actualPrice - expectedPrice);
  expect(
    priceDifference,
    `Стоимость заказа энергии ${actualPrice} не совпадает с расчетной по формуле ${expectedPrice} (разница: ${priceDifference})`
  ).toBeLessThanOrEqual(tolerance);
}


export async function getBandwidthPriceForPeriod(
  coreRepo: CoreRepository,
  period: BandwidthOrderPeriodMs
): Promise<number> {
  const priceBandwidthResponse = await coreRepo.coreConstantsKeyGet("PRICE_BANDWIDTH");
  const priceBandwidth: BandwidthPriceValues = priceBandwidthResponse.data;

  if (period === OrderPeriod.ONE_HOUR) {
    return priceBandwidth["1h"];
  } else if (period === OrderPeriod.ONE_DAY) {
    return priceBandwidth["1d"];
  } else {
    throw new Error(`Неподдерживаемый период для полосы пропускания: ${period}`);
  }
}


function bandwidthPeriodToHoursAndDays(
  period: BandwidthOrderPeriodMs
): { hour: number; day: number } {
  if (period === OrderPeriod.ONE_HOUR) {
    return { hour: 1, day: 0 };
  } else if (period === OrderPeriod.ONE_DAY) {
    return { hour: 0, day: 1 };
  } else {
    throw new Error(`Неподдерживаемый период полосы пропускания: ${period}`);
  }
}

export async function calculateExpectedBandwidthPrice(
  coreRepo: CoreRepository,
  period: BandwidthOrderPeriodMs,
  bandwidthAmount: number
): Promise<number> {
  const sunRate = await getBandwidthPriceForPeriod(coreRepo, period);
  const { hour, day } = bandwidthPeriodToHoursAndDays(period);
  return BANDWIDTH_PRICE_FORMULA(sunRate, hour, day, bandwidthAmount);
}


export async function validateBandwidthOrderPriceByFormula(
  order: Order,
  coreRepo: CoreRepository,
  period: BandwidthOrderPeriodMs,
  bandwidthAmount: number,
  tolerance = 0.03
): Promise<void> {
  const expectedPrice = await calculateExpectedBandwidthPrice(coreRepo, period, bandwidthAmount);
  const actualPrice = typeof order.sellPrice === "string" ? parseFloat(order.sellPrice) : order.sellPrice;

  log.info(
    `Проверка цены полосы пропускания: ожидаемая (по формуле) = ${expectedPrice}, фактическая (API) = ${actualPrice}`
  );

  const priceDifference = Math.abs(actualPrice - expectedPrice);
  expect(
    priceDifference,
    `Стоимость заказа полосы пропускания ${actualPrice} не совпадает с расчетной по формуле ${expectedPrice} (разница: ${priceDifference})`
  ).toBeLessThanOrEqual(tolerance);
}

export function checkOrderCost(
  order: Order,
  expectedCost: number,
  tolerance = 0.01,
  message?: string
): void {
  const actualCost =
    typeof order.sellPrice === "string" ? parseFloat(order.sellPrice) : order.sellPrice;
  const costDifference = Math.abs(actualCost - expectedCost);
  const errorMessage =
    message ||
    `Стоимость заказа ${actualCost} не совпадает с ожидаемой ${expectedCost} (разница: ${costDifference})`;
  expect(costDifference, errorMessage).toBeLessThanOrEqual(tolerance);
}

export function checkSmartOrderOrdersPrices(orders: Order[]): void {
  expect(orders.length).toBeGreaterThan(0);
  let totalCost = 0;
  for (const order of orders) {
    const orderCost =
      typeof order.sellPrice === "string" ? parseFloat(order.sellPrice) : order.sellPrice;
    expect(orderCost, `Стоимость заказа ${order.type} должна быть больше нуля`).toBeGreaterThan(0);
    totalCost += orderCost;
    log.info(`Заказ ${order.type} (id=${order.id}): стоимость=${orderCost} TRX`);
  }
  expect(totalCost, `Общая стоимость всех заказов должна быть больше нуля`).toBeGreaterThan(0);
  log.info(`Общая стоимость всех заказов в smart order: ${totalCost} TRX`);
}

