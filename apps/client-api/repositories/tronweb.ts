import { TronWeb } from "tronweb";
import { fullHost } from "../api/constants";

const tronWeb = new TronWeb({
  fullHost: fullHost,
});

export async function createWallet() {
  return tronWeb.createAccount();
}

export { tronWeb };
