import { log } from "@shared/utils/logger";

export async function calculateExecutionTime<T>(
  callback: () => Promise<T>,
  requestCount: number
): Promise<T> {
  const startTime = Date.now();
  const result = await callback();
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  log.info(`Все ${requestCount} запросов выполнены за ${duration.toFixed(2)} секунд`);
  return result;
}

