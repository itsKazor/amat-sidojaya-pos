import { db } from './connection.js';
import { categories, products, transactions, transactionItems, stockMovements } from './schema.js';

async function clear() {
  console.log('Clearing database tables...');
  try {
    await db.delete(stockMovements);
    await db.delete(transactionItems);
    await db.delete(transactions);
    await db.delete(products);
    await db.delete(categories);
    console.log('Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Clearing failed:', error);
    process.exit(1);
  }
}

clear();
