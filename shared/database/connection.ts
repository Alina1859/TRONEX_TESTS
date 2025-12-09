import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { log } from '../utils/logger';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.API_KEY_PRIMARY) {
  throw new Error('API_KEY_PRIMARY is not defined in environment variables');
}

if (!process.env.API_URL) {
  throw new Error('API_URL is not defined in environment variables');
}

const createClient = (connectionString: string | undefined, name: string) => {
  if (!connectionString) {
    log.warn(`Database URL for ${name} is not defined.`);
    throw new Error(`Database URL for ${name} is not defined.`);
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

let coreDbInstance: PrismaClient;
let adminDbInstance: PrismaClient;
let botDbInstance: PrismaClient;

export const coreDb = new Proxy({} as PrismaClient, {
  get: (_target, prop) => {
    if (!coreDbInstance) coreDbInstance = createClient(process.env.CORE_DATABASE_URL, 'CORE');
    return (coreDbInstance as any)[prop];
  }
});

export const adminDb = new Proxy({} as PrismaClient, {
  get: (_target, prop) => {
    if (!adminDbInstance) adminDbInstance = createClient(process.env.ADMIN_DATABASE_URL, 'ADMIN');
    return (adminDbInstance as any)[prop];
  }
});

export const botDb = new Proxy({} as PrismaClient, {
  get: (_target, prop) => {
    if (!botDbInstance) botDbInstance = createClient(process.env.BOT_DATABASE_URL, 'BOT');
    return (botDbInstance as any)[prop];
  }
});

