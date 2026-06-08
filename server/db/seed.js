import { db } from './connection.js';
import { categories } from './schema.js';
import { count } from 'drizzle-orm';

const defaultCategories = [
  { name: 'Oli', description: 'Oli mesin dan transmisi' },
  { name: 'Ban', description: 'Ban luar dan dalam' },
  { name: 'Aki', description: 'Aki basah dan kering' },
  { name: 'Busi', description: 'Busi motor dan mobil' },
  { name: 'Kampas Rem', description: 'Kampas rem depan dan belakang' },
  { name: 'Rantai & Gir', description: 'Rantai dan gir set motor' },
  { name: 'Filter', description: 'Filter udara, oli, dan AC' },
  { name: 'Lampu', description: 'Lampu utama, rem, dan lampu sein' }
];

async function seed() {
  console.log('Seeding database...');
  try {
    // Check if categories table is empty
    const existing = await db.select({ value: count() }).from(categories);
    const totalCount = existing[0]?.value || 0;

    if (totalCount === 0) {
      for (const cat of defaultCategories) {
        await db.insert(categories).values(cat);
      }
      console.log('Database seeded successfully!');
    } else {
      console.log('Database already has data. Skipping seed.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
