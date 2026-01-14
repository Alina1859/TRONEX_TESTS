import { TronWeb } from "tronweb";
import { fullHost, privateKeyShasta, addressWithTrx } from "../api/constants";

const tronWeb = new TronWeb({
  fullHost,
});

const walletPrivateKeys = new Map<string, string>();

export async function createWallet() {
  const wallet = await tronWeb.createAccount();
  const base58 = wallet.address?.base58;
  if (base58 && wallet.privateKey) {
    walletPrivateKeys.set(base58, wallet.privateKey);
  }
  return wallet;
}

export async function sendTrx(params: { toAddress: string; amountTrx: number }) {
  const { toAddress, amountTrx } = params;

  const fromAddress = addressWithTrx;

  tronWeb.setPrivateKey(privateKeyShasta);

  const amountSun = Number(tronWeb.toSun(amountTrx));

  const tx = await tronWeb.transactionBuilder.sendTrx(toAddress, amountSun, fromAddress);

  const signedTx = await tronWeb.trx.sign(tx);
  return tronWeb.trx.sendRawTransaction(signedTx);
}

export function getWalletPrivateKey(address: string): string | undefined {
  return walletPrivateKeys.get(address);
}

export function createTronWebForPrivateKey(privateKey: string) {
  return new TronWeb({
    fullHost,
    privateKey,
  });
}

export { tronWeb };
