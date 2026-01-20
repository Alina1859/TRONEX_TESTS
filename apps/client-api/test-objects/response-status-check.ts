import { expect, APIResponse } from "@playwright/test";
import { log } from "@shared/utils/logger";
import { HttpStatus } from "@shared/utils/constants";

type ResponseWithStatus = APIResponse | { status: number };

export class ResponseStatusCheck {
  checkResponseStatus(response: ResponseWithStatus, expectedStatus: number = HttpStatus.OK): void {
    const actualStatus = this.getStatus(response);

    this.logStatusCheck(actualStatus, expectedStatus);
    expect(actualStatus).toBe(expectedStatus);
  }

  async processRateLimitResponses(
    responses: APIResponse[],
    requestCount: number
  ): Promise<Record<number, number>> {
    const statusCounts = this.countStatuses(responses);
    const rateLimitInfo = await this.extractRateLimitInfo(responses);

    this.logStatusDistribution(statusCounts);
    this.logRateLimitResult(rateLimitInfo, requestCount);

    return statusCounts;
  }

  private getStatus(response: ResponseWithStatus): number {
    if (response instanceof Object && "status" in response) {
      return typeof response.status === "function" ? response.status() : response.status;
    }
    return (response as APIResponse).status();
  }

  private logStatusCheck(actualStatus: number, expectedStatus: number): void {
    log.info(` Статус ответа: ожидаемый ${expectedStatus}, фактический ${actualStatus}`);

    const isMatch = actualStatus === expectedStatus;
    log.info(
      isMatch
        ? `✅ Статус ответа корректен: ${actualStatus}`
        : `❌ Статус ответа не совпадает: ожидался ${expectedStatus}, получен ${actualStatus}`
    );
  }

  private countStatuses(responses: APIResponse[]): Record<number, number> {
    const statusCounts: Record<number, number> = {};

    for (const response of responses) {
      const status = response.status();
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }

    return statusCounts;
  }

  private async extractRateLimitInfo(responses: APIResponse[]): Promise<{
    hit: boolean;
    requestIndex: number;
    response: any;
    retryAfter?: string;
  }> {
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const status = response.status();

      if (status === HttpStatus.TOO_MANY_REQUESTS) {
        const rateLimitResponse = await response.json().catch(() => null);
        const headers = response.headers();
        const retryAfter = headers["retry-after"] || headers["Retry-After"];

        this.logRateLimitDetection({
          requestIndex: i + 1,
          status,
          retryAfter,
          rateLimitResponse,
        });

        return {
          hit: true,
          requestIndex: i + 1,
          response: rateLimitResponse,
          retryAfter,
        };
      }
    }

    return { hit: false, requestIndex: -1, response: null };
  }

  private logRateLimitDetection({
    requestIndex,
    status,
    retryAfter,
    rateLimitResponse,
  }: {
    requestIndex: number;
    status: number;
    retryAfter?: string;
    rateLimitResponse?: any;
  }): void {
    log.info(`✅ Rate limiting обнаружен на запросе #${requestIndex}`);
    log.info(`  Статус: ${status} (Too Many Requests)`);

    if (retryAfter) {
      log.info(`  Retry-After: ${retryAfter}`);
    }

    if (rateLimitResponse) {
      log.info(`  Ответ: ${JSON.stringify(rateLimitResponse, null, 2)}`);
    }
  }

  private logStatusDistribution(statusCounts: Record<number, number>): void {
    log.info("Распределение статусов ответов:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      log.info(`  ${status}: ${count} запросов`);
    });
  }

  private logRateLimitResult(
    rateLimitInfo: { hit: boolean; requestIndex: number },
    requestCount: number
  ): void {
    if (rateLimitInfo.hit) {
      log.info(
        `✅ Rate limiting работает корректно. API вернул ${HttpStatus.TOO_MANY_REQUESTS} после превышения лимита.`
      );
    } else {
      log.warn(`⚠ Rate limiting не был обнаружен после ${requestCount} параллельных запросов.`);
      log.warn("  Это может означать, что лимит выше ожидаемого или rate limiting не настроен.");
    }
  }
}
