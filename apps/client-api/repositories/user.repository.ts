import { coreDb } from '../../../shared/database/connection';

export class UserRepository {
  
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

