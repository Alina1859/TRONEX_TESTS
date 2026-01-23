import { expect } from "@playwright/test";
import { ProviderSettings } from "@shared/utils/types";

export class ProviderPriorityCheck {
  checkProviderPriority(data: ProviderSettings, providerName: string, priorityValue: number) {
    expect(data, `Настройки не содержат провайдера ${providerName}`).toHaveProperty(providerName);
    expect(
      data[providerName],
      `Провайдер ${providerName} не имеет свойства priority`
    ).toHaveProperty("priority");
    expect(
      data[providerName].priority,
      `Приоритет провайдера ${providerName} не равен ${priorityValue}`
    ).toBe(priorityValue);
  }
}
