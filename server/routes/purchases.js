import express from 'express';
import { db } from '../db/connection.js';
import { transactions, transactionItems, products, stockMovements } from '../db/schema.js';
import { eq, and, gte, lte, desc, count, sql, like } from 'drizzle-orm';

const router = express.Router();

// Helper to generate Purchase Invoice Number (PUR-YYYYMMDD-XXX)
const generatePurchaseInvoiceNumber = async (tx) => {
  const now = new Date();
  const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const year = wibTime.getUTCFullYear();
  const month = String(wibTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(wibTime.getUTCDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const prefix = `PUR-${dateStr}-`;
  
  // Uses tx (transaction object) to prevent race conditions
  const list = await tx.select({ invoiceNumber: transactions.invoiceNumber })
    .from(transactions)
    .where(and(eq(transactions.type, 'purchase'), like(transactions.invoiceNumber, `${prefix}%`)));
  
  let maxNum = 0;
  list.forEach(t => {
    const parts = t.invoiceNumber.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  });

  const nextNum = maxNum + 1;
  const seqStr = nextNum.toString().padStart(3, '0');
  return `${prefix}${seqStr}`;
};

// GET all purchase transactions
router.get('/', async (req, res) => {
  const { from, to, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = [eq(transactions.type, 'purchase')];

    if (from) {
      conditions.push(gte(transactions.transactionDate, from));
    }
    if (to) {
      conditions.push(lte(transactions.transactionDate, to));
    }

    const whereClause = and(...conditions);

    // Get total count
    const totalCountResult = await db.select({ value: count() })
      .from(transactions)
      .where(whereClause);
    const total = totalCountResult[0]?.value || 0;

    // Get list sorted by date descending
    const list = await db.select()
      .from(transactions)
      .where(whereClause)
      .orderBy(desc(transactions.transactionDate), desc(transactions.id))
      .limit(parseInt(limit))
      .offset(offset);

    res.json({
      success: true,
      data: list,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new purchase (restok) transaction
router.post('/', async (req, res) => {
  const { supplierName, notes, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Daftar barang pembelian tidak boleh kosong' });
  }

  try {
    const result = await db.transaction(async (tx) => {
      let totalAmount = 0;
      const processedItems = [];

      // 1. Process items and fetch details
      for (const item of items) {
        const { product_id, quantity, unit_price } = item;
        
        if (!product_id || !quantity || quantity <= 0 || !unit_price || unit_price <= 0) {
          throw new Error('Data item restok tidak valid');
        }

        const prod = await tx.select().from(products).where(eq(products.id, product_id));
        if (prod.length === 0) {
          throw new Error(`Produk dengan ID ${product_id} tidak ditemukan`);
        }

        const product = prod[0];
        const subtotal = quantity * unit_price;
        totalAmount += subtotal;

        processedItems.push({
          productId: product_id,
          quantity,
          unitPrice: unit_price, // supplier price
          subtotal,
          productName: product.name,
          currentStock: product.stock
        });
      }

      // 2. Generate Invoice Number
      const invoiceNumber = await generatePurchaseInvoiceNumber(tx);
      const transactionDate = new Date().toISOString();

      // 3. Insert transaction header (profit is 0 for purchase)
      const [insertedTxn] = await tx.insert(transactions).values({
        invoiceNumber,
        type: 'purchase',
        transactionDate,
        totalAmount,
        totalProfit: 0,
        supplierName: supplierName || 'Supplier Umum',
        notes
      }).returning();

      // 4. Update stocks, purchase price, insert details, and logs
      for (const item of processedItems) {
        // Insert transaction items
        await tx.insert(transactionItems).values({
          transactionId: insertedTxn.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice, // store purchase unit price
          purchasePriceSnapshot: item.unitPrice, // snapshot is same as purchase price for purchase type
          subtotal: item.subtotal,
          profit: 0 // No profit for restok
        });

        // Update product stock and purchase price
        const newStock = item.currentStock + item.quantity;
        await tx.update(products)
          .set({ 
            stock: newStock,
            purchasePrice: item.unitPrice // Update to latest purchase price
          })
          .where(eq(products.id, item.productId));

        // Create stock movement record
        await tx.insert(stockMovements).values({
          productId: item.productId,
          transactionId: insertedTxn.id,
          type: 'in',
          quantity: item.quantity, // Positive for in
          stockBefore: item.currentStock,
          stockAfter: newStock,
          notes: `Pembelian ${invoiceNumber}`
        });
      }

      return insertedTxn;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
