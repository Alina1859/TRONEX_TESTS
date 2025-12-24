import { coreDb } from "@shared/database/connection";

export class UserRepository {
  async findUserIdByApiKey(apiKeyPrimary: string): Promise<string | null> {
    const result = await coreDb.$queryRaw<{ userId: string }[]>`
      SELECT "userId" 
      FROM "AccessToken" 
      WHERE token = ${apiKeyPrimary}
      LIMIT 1
    `;

    if (result && result.length > 0) {
      return result[0].userId;
    }

    return null;
  }
}
