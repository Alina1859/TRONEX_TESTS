import { expect } from "@playwright/test";
import { ProviderSettings } from "@shared/utils/types";

export class ProviderPriorityCheck {
  checkProviderPriorityResponse(
    responseData: ProviderSettings,
    providerName: string,
    priorityValue: number
  ) {
    expect(responseData).toHaveProperty(providerName);
    expect(responseData[providerName]).toHaveProperty("priority");
    expect(responseData[providerName].priority).toBe(priorityValue);
  }

  checkProviderPrioritySaved(
    verifyData: ProviderSettings,
    providerName: string,
    priorityValue: number
  ) {
    expect(verifyData).toHaveProperty(providerName);
    expect(verifyData[providerName].priority).toBe(priorityValue);
  }
}

