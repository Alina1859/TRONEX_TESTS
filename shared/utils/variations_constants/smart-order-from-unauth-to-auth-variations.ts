import type { FromUnauthToAuthCombination } from "@shared/utils/types";

export const FROM_UNAUTH_TO_AUTH_COMBINATIONS: FromUnauthToAuthCombination[] = [
  {
    description:
      "fromAddress неактивирован; toAddress активен; withActivation=true, withEnergy=true, withBandwidth=true; ожидается ACTIVATION и ENERGY orders",
    withActivation: true,
    withEnergy: true,
    withBandwidth: true,
  },
  {
    description:
      "fromAddress неактивирован; toAddress активен; withActivation=true, withEnergy=true, withBandwidth=false; ожидается ACTIVATION и ENERGY orders",
    withActivation: true,
    withEnergy: true,
    withBandwidth: false,
  },
  {
    description:
      "fromAddress неактивирован; toAddress активен; withActivation=true, withEnergy=false, withBandwidth=true; ожидается только ACTIVATION order",
    withActivation: true,
    withEnergy: false,
    withBandwidth: true,
  },
  {
    description:
      "fromAddress неактивирован; toAddress активен; withActivation=true, withEnergy=false, withBandwidth=false; ожидается только ACTIVATION order",
    withActivation: true,
    withEnergy: false,
    withBandwidth: false,
  },
];
