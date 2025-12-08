import { coreDb } from '../database/connection';

export class UserRepository {
  /**
   * Finds a user ID by their API key (AccessToken).
   * @param apiKey The API key (token) to look up.
   * @returns The userId if found, or null.
   */
  async findUserIdByApiKey(apiKey: string): Promise<string | null> {
    const result = await coreDb.$queryRaw<any[]>`
      SELECT "userId" 
      FROM "AccessToken" 
      WHERE token = ${apiKey}
      LIMIT 1
    `;

    if (result && result.length > 0) {
      return result[0].userId;
    }
    
    return null;
  }
}

