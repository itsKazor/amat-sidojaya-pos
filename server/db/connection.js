import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve('data/amat-sidojaya.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Prefix local file paths with 'file:' for libsql client
const client = createClient({
  url: `file:${dbPath}`,
});

export const db = drizzle({ client });
