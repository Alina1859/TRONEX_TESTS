import { PrismaClient } from '@prisma/client';

console.log('Inspecting PrismaClient constructor...');
try {
  // @ts-ignore
  const client = new PrismaClient({
    datasources: { db: { url: 'foo' } }
  } as any);
  console.log('Success with datasources');
} catch (e: any) {
  console.log('Failed with datasources:', e.message);
}

try {
  // @ts-ignore
  const client = new PrismaClient({
    datasourceUrl: 'foo'
  } as any);
  console.log('Success with datasourceUrl');
} catch (e: any) {
  console.log('Failed with datasourceUrl:', e.message);
}
