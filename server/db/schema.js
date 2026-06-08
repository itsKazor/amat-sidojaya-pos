import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Kategori sparepart
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// Produk / Sparepart
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  vehicleType: text('vehicle_type').$type(), // 'motor', 'mobil', 'universal'
  brand: text('brand'),
  stock: integer('stock').default(0).notNull(),
  minStock: integer('min_stock').default(5).notNull(),
  purchasePrice: integer('purchase_price').default(0).notNull(),
  sellingPrice: integer('selling_price').default(0).notNull(),
  unit: text('unit').default('pcs').notNull(), // 'pcs', 'set', 'liter', 'meter', 'box'
  location: text('location'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// Transaksi (Header)
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceNumber: text('invoice_number').notNull().unique(),
  type: text('type').notNull(), // 'sale', 'purchase'
  transactionDate: text('transaction_date').notNull(),
  totalAmount: integer('total_amount').default(0).notNull(),
  totalProfit: integer('total_profit').default(0).notNull(), // Hanya untuk sale
  customerName: text('customer_name'), // Opsional untuk sale
  supplierName: text('supplier_name'), // Opsional untuk purchase
  notes: text('notes'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// Item Transaksi (Detail)
export const transactionItems = sqliteTable('transaction_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  transactionId: integer('transaction_id').notNull().references(() => transactions.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  purchasePriceSnapshot: integer('purchase_price_snapshot').default(0).notNull(),
  subtotal: integer('subtotal').notNull(),
  profit: integer('profit').default(0).notNull(),
});

// Pergerakan Stok
export const stockMovements = sqliteTable('stock_movements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id),
  transactionId: integer('transaction_id').references(() => transactions.id),
  type: text('type').notNull(), // 'in', 'out', 'adjustment'
  quantity: integer('quantity').notNull(),
  stockBefore: integer('stock_before').notNull(),
  stockAfter: integer('stock_after').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});
