import { expect } from "@playwright/test";

export class AddressCheck {
  checkTronAddress(address: string): void {
    expect(address.length).toBe(34);
    expect(address.startsWith("T")).toBe(true);

    const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    expect(base58Regex.test(address)).toBe(true);
  }
}

