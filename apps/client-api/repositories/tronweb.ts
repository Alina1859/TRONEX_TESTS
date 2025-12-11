import { TronWeb } from "tronweb";

const tronWeb = new TronWeb({
  fullHost: "https://api.shasta.trongrid.io",
});

export async function createWallet() {
  return tronWeb.createAccount();
}

export { tronWeb };
