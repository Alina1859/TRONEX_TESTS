import { APIRequestContext } from "@playwright/test";
import {
  createWallet,
  sendTrx,
  getWalletPrivateKey,
  createTronWebForPrivateKey,
} from "@apps/client-api/repositories/tronweb";
import { log } from "@shared/utils/logger";
import { SmartOrderRepository } from "@apps/client-api/repositories/smart-order.repository";
import { OrderApi } from "@apps/client-api/api/order.api";
import { ResponseStatusCheck } from "@apps/client-api/test-objects/response-status-check";
import { WalletActivationHelper } from "@shared/helpers/wallet-activation-helper";
import { CreateActivationOrderRequest, CreateOrderRequest, Order } from "@shared/utils/types";
import { HttpStatus, OrderPeriod, OrderType } from "@shared/utils/constants";
import { addressWithTrx } from "@apps/client-api/api/constants";

export class SmartOrderTestHelper {
  private readonly smartOrderRepo = new SmartOrderRepository();
  private readonly walletActivationHelper = new WalletActivationHelper();
  private readonly statusCheck = new ResponseStatusCheck();

  async createAndActivateFromAddress(
    request: APIRequestContext,
    timeoutMs = 30000,
    stepMs = 1000
  ): Promise<string> {
    const wallet = await createWallet();
    const fromAddress = wallet.address?.base58 || "";
    log.info(`Создан кошелек fromAddress: ${fromAddress}`);

    const orderApi = new OrderApi(request);
    const activationRequest: CreateActivationOrderRequest = {
      type: OrderType.ACTIVATION,
      targetAddress: fromAddress,
    };

    const activationResponse = await orderApi.createNewOrder({ data: activationRequest });
    const activationStatus = activationResponse.status();
    log.info(`API запрос (ACTIVATION) выполнен. Статус: ${activationStatus}`);
    this.statusCheck.checkResponseStatus(activationResponse);

    const activationOrder = (await activationResponse.json()) as Order;
    log.info(`API Response (ACTIVATION): ${JSON.stringify(activationOrder, null, 2)}`);

    await this.walletActivationHelper.waitForActivationCompleted({
      orderId: activationOrder.id,
      targetAddress: fromAddress,
      timeoutMs,
      stepMs,
    });
    log.info(`Кошелек fromAddress активирован: ${fromAddress}`);

    return fromAddress;
  }

  async createFromAddressWithResources(
    request: APIRequestContext,
    { energyAmount = 65000 }: { energyAmount?: number } = {}
  ): Promise<string> {
    const fromAddress = await this.createAndActivateFromAddress(request);

    const orderApi = new OrderApi(request);

    const energyOrderRequest: CreateOrderRequest = {
      type: OrderType.ENERGY,
      targetAddress: fromAddress,
      amount: energyAmount,
      period: OrderPeriod.ONE_DAY as any,
    };

    log.info(
      `Создание ENERGY заказа для пополнения ресурсов fromAddress: ${JSON.stringify(
        energyOrderRequest,
        null,
        2
      )}`
    );
    const energyResponse = await orderApi.createNewOrder({ data: energyOrderRequest });
    this.statusCheck.checkResponseStatus(energyResponse, HttpStatus.OK);
    const energyOrder = (await energyResponse.json()) as Order;
    await this.walletActivationHelper.waitForOrderCompleted({ orderId: energyOrder.id });

    log.info(
      `fromAddress ${fromAddress} активирован и пополнен ресурсами: ENERGY >= ${energyAmount}`
    );

    return fromAddress;
  }

  async createFromAddressWithResourcesAndLowBandwidth(
    request: APIRequestContext,
    {
      energyAmount = 65000,
      bandwidthThreshold = 350,
      maxTransfers = 20,
    }: { energyAmount?: number; bandwidthThreshold?: number; maxTransfers?: number } = {}
  ): Promise<string> {
    const fromAddress = await this.createFromAddressWithResources(request, { energyAmount });

    log.info(
      `Пополнение TRX для fromAddress ${fromAddress} с addressWithTrx ${addressWithTrx} перед снижением Bandwidth`
    );
    await sendTrx({ toAddress: fromAddress, amountTrx: 20 });

    await this.drainBandwidthBelowThreshold(fromAddress, bandwidthThreshold, maxTransfers);

    return fromAddress;
  }

  async createActivatedFromAddressWithLowBandwidth(
    request: APIRequestContext,
    {
      bandwidthThreshold = 350,
      maxTransfers = 20,
    }: { bandwidthThreshold?: number; maxTransfers?: number } = {}
  ): Promise<string> {
    const fromAddress = await this.createAndActivateFromAddress(request);

    log.info(
      `Пополнение TRX для fromAddress ${fromAddress} с addressWithTrx ${addressWithTrx} перед снижением Bandwidth`
    );
    await sendTrx({ toAddress: fromAddress, amountTrx: 20 });

    await this.drainBandwidthBelowThreshold(fromAddress, bandwidthThreshold, maxTransfers);

    return fromAddress;
  }

  private async drainBandwidthBelowThreshold(
    fromAddress: string,
    bandwidthThreshold: number,
    maxTransfers: number
  ) {
    const privateKey = getWalletPrivateKey(fromAddress);
    if (!privateKey) {
      throw new Error(
        `Не найден приватный ключ для адреса ${fromAddress}. Убедитесь, что кошелёк создан через createWallet()`
      );
    }

    const tronWebForFrom = createTronWebForPrivateKey(privateKey);

    for (let i = 0; i < maxTransfers; i++) {
      const resources = await tronWebForFrom.trx.getAccountResources(fromAddress);
      const freeNetLimit = (resources.freeNetLimit as number) ?? 0;
      const freeNetUsed = (resources.freeNetUsed as number) ?? 0;
      const remainingBandwidth = freeNetLimit - freeNetUsed;

      log.info(
        `Bandwidth для ${fromAddress}: remaining=${remainingBandwidth}, freeNetLimit=${freeNetLimit}, freeNetUsed=${freeNetUsed}`
      );

      if (remainingBandwidth < bandwidthThreshold) {
        log.info(
          `Bandwidth для ${fromAddress} ниже порога ${bandwidthThreshold}, дальнейшее снижение не требуется`
        );
        return;
      }

      const amountSun = Number(tronWebForFrom.toSun(1));
      log.info(
        `Отправка 1 TRX с ${fromAddress} на addressWithTrx ${addressWithTrx} для снижения Bandwidth (итерация ${i + 1}/${maxTransfers})`
      );
      const tx = await tronWebForFrom.transactionBuilder.sendTrx(
        addressWithTrx,
        amountSun,
        fromAddress
      );
      const signed = await tronWebForFrom.trx.sign(tx);
      await tronWebForFrom.trx.sendRawTransaction(signed);

      const resourcesAfter = await tronWebForFrom.trx.getAccountResources(fromAddress);
      const freeNetLimitAfter = (resourcesAfter.freeNetLimit as number) ?? 0;
      const freeNetUsedAfter = (resourcesAfter.freeNetUsed as number) ?? 0;
      const remainingAfter = freeNetLimitAfter - freeNetUsedAfter;
      log.info(
        `После перевода 1 TRX Bandwidth для ${fromAddress}: remaining=${remainingAfter}, freeNetLimit=${freeNetLimitAfter}, freeNetUsed=${freeNetUsedAfter}`
      );

      await new Promise((r) => setTimeout(r, 1000));
    }

    throw new Error(
      `Не удалось снизить Bandwidth для ${fromAddress} ниже ${bandwidthThreshold} за ${maxTransfers} транзакций`
    );
  }

  async waitForSmartOrderCompleted(
    smartOrderId: number,
    timeoutMs = 90000,
    stepMs = 1000
  ): Promise<any> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const dbRows = await this.smartOrderRepo.getSmartOrderById(smartOrderId);
      const dbSmartOrder = dbRows[0] as any;

      const status = dbSmartOrder?.status;
      if (status === "FAILED") {
        log.info(`Smart Order в БД завершился FAILED (smartOrderId=${smartOrderId})`);
        throw new Error(
          `Smart Order smartOrderId=${smartOrderId} завершился FAILED. DB: ${JSON.stringify(
            dbSmartOrder,
            null,
            2
          )}`
        );
      }

      if (status === "COMPLETED") {
        log.info(`Smart Order в БД завершился COMPLETED (smartOrderId=${smartOrderId})`);
        return dbSmartOrder;
      }

      log.info(
        `Smart Order smartOrderId=${smartOrderId} ещё не в финальном статусе, статус=${status ?? "none"}`
      );
      await new Promise((r) => setTimeout(r, stepMs));
    }

    throw new Error(
      `Smart Order smartOrderId=${smartOrderId} не перешёл в COMPLETED за ${timeoutMs} мс`
    );
  }
}
