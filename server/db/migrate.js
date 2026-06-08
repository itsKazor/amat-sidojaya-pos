import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './connection.js';
import path from 'path';

console.log('Running migrations...');
try {
  await migrate(db, { migrationsFolder: path.resolve('drizzle') });
  console.log('Migrations applied successfully!');
  process.exit(0);
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
