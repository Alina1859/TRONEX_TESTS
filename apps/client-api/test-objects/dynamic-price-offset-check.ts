import { expect } from "@playwright/test";
import { DYNAMIC_PRICE_OFFSET_TEST_VALUE } from "@shared/utils/constants";

export class DynamicPriceOffsetCheck {
  checkDynamicPriceOffset(data: number | null, expectedValue: number = DYNAMIC_PRICE_OFFSET_TEST_VALUE) {
    expect(
      data,
      `DYNAMIC_PRICE_OFFSET не равен ожидаемому значению ${expectedValue}`
    ).toBe(expectedValue);
  }

  checkDynamicPriceOffsetIsNull(data: number | null) {
    expect(
      data,
      `DYNAMIC_PRICE_OFFSET не равен null`
    ).toBeNull();
  }
}

