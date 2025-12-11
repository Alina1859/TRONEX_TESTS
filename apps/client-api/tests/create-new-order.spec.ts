import { test, expect } from "@playwright/test";
import { createWallet } from "../repositories/tronweb";
import { log } from "../../../shared/utils/logger";

test.describe("Create new wallet", () => {
  test("should create new Tron wallet", async () => {
    const wallet = await createWallet();

    log.info(`Создан новый кошелек: ${wallet.address?.base58}`);
    log.info(`Private key: ${wallet.privateKey}`);

    expect(wallet.address?.base58).toBeTruthy();
    expect(wallet.privateKey).toBeTruthy();
  });
});
