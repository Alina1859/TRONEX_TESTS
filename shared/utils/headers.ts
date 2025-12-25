import { apiKeyPrimary, coreApiToken } from "../../apps/client-api/api/constants";

export function getHeaders(apiKey: string = apiKeyPrimary) {
  return {
    Accept: "application/json",
    "X-API-KEY": apiKey,
  };
}

export function getPostHeaders(apiKey: string = apiKeyPrimary) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-API-KEY": apiKey,
  };
}

export function getCoreApiHeaders(token: string = coreApiToken) {
  return {
    "X-Api-Token": token,
  };
}

export function getCoreApiPostHeaders(token: string = coreApiToken) {
  return {
    "Content-Type": "application/json",
    "X-Api-Token": token,
  };
}
