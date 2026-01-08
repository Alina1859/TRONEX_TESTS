import { expect, APIResponse } from "@playwright/test";
import { log } from "@shared/utils/logger";
import { HTTP_STATUS_OK } from "@shared/utils/constants";

export class ResponseStatusCheck {

  checkResponseStatus(
    response: APIResponse | { status: number },
    expectedStatus: number = HTTP_STATUS_OK
  ) {
    const actualStatus = this.getStatus(response);

    log.info(`📋 Статус ответа: ожидаемый ${expectedStatus}, фактический ${actualStatus}`);

    const isMatch = actualStatus === expectedStatus;
    log.info(isMatch
      ? `✅ Статус ответа корректен: ${actualStatus}`
      : `❌ Статус ответа не совпадает: ожидался ${expectedStatus}, получен ${actualStatus}`
    );

    expect(actualStatus).toBe(expectedStatus);
  }


  private getStatus(response: APIResponse | { status: number }): number {
    return typeof (response as APIResponse).status === "function"
      ? (response as APIResponse).status()
      : (response as { status: number }).status;
  }


  async processRateLimitResponses(
    responses: APIResponse[],
    requestCount: number
  ): Promise<Record<number, number>> {
    const statusCounts: Record<number, number> = {};
    let rateLimitHit = false;
    let rateLimitResponse: any = null;
    let retryAfter: string | undefined;

    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const status = response.status();
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      if (status === 429 && !rateLimitHit) {
        rateLimitHit = true;
        rateLimitResponse = await response.json().catch(() => null);
        const headers = response.headers();
        retryAfter = headers["retry-after"] || headers["Retry-After"];

        log.info(`✓ Rate limiting обнаружен на запросе #${i + 1}`);
        log.info(`  Статус: ${status} (Too Many Requests)`);
        if (retryAfter) {
          log.info(`  Retry-After: ${retryAfter}`);
        }
        if (rateLimitResponse) {
          log.info(`  Ответ: ${JSON.stringify(rateLimitResponse, null, 2)}`);
        }
      }
    }

    log.info("Распределение статусов ответов:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      log.info(`  ${status}: ${count} запросов`);
    });

    if (rateLimitHit) {
      log.info("✓ Rate limiting работает корректно. API вернул 429 после превышения лимита.");
    } else {
      log.warn(`⚠ Rate limiting не был обнаружен после ${requestCount} параллельных запросов.`);
      log.warn("  Это может означать, что лимит выше ожидаемого или rate limiting не настроен.");
    }

    return statusCounts;
  }
}
