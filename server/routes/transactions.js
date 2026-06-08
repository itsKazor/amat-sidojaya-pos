import express from 'express';
import { db } from '../db/connection.js';
import { transactions, transactionItems, products, stockMovements } from '../db/schema.js';
import { eq, and, gte, lte, desc, count, sql, like } from 'drizzle-orm';

const router = express.Router();

// Helper to generate Invoice Number (INV-YYYYMMDD-XXX)
const generateInvoiceNumber = async () => {
  // Get date in YYYYMMDD format (using WIB timezone: UTC+7)
  const now = new Date();
  const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const year = wibTime.getUTCFullYear();
  const month = String(wibTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(wibTime.getUTCDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const prefix = `INV-${dateStr}-`;
  
  // Find transactions of type 'sale' with invoice starting with prefix
  const list = await db.select({ invoiceNumber: transactions.invoiceNumber })
    .from(transactions)
    .where(and(eq(transactions.type, 'sale'), like(transactions.invoiceNumber, `${prefix}%`)));
  
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

// GET all sales transactions
router.get('/', async (req, res) => {
  const { from, to, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = [eq(transactions.type, 'sale')];

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

// GET transaction detail by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const txn = await db.select().from(transactions).where(eq(transactions.id, parseInt(id)));
    if (txn.length === 0) {
      return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan' });
    }

    // Get transaction items with product details
    const items = await db.select({
      id: transactionItems.id,
      productId: transactionItems.productId,
      productCode: products.code,
      productName: products.name,
      quantity: transactionItems.quantity,
      unitPrice: transactionItems.unitPrice,
      purchasePriceSnapshot: transactionItems.purchasePriceSnapshot,
      subtotal: transactionItems.subtotal,
      profit: transactionItems.profit,
      unit: products.unit
    })
    .from(transactionItems)
    .leftJoin(products, eq(transactionItems.productId, products.id))
    .where(eq(transactionItems.transactionId, parseInt(id)));

    res.json({
      success: true,
      data: {
        ...txn[0],
        items
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new sales transaction
router.post('/', async (req, res) => {
  const { customerName, notes, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Keranjang belanja tidak boleh kosong' });
  }

  try {
    // Run everything inside a Drizzle Transaction for database safety
    const result = await db.transaction(async (tx) => {
      let totalAmount = 0;
      let totalProfit = 0;
      const processedItems = [];
      const stockUpdates = [];

      // 1. Process and validate all items
      for (const item of items) {
        const { product_id, quantity, unit_price } = item;
        
        if (!product_id || !quantity || quantity <= 0) {
          throw new Error('Data item belanja tidak valid');
        }

        // Fetch product info from DB (with write lock simulation via transaction)
        const prod = await tx.select().from(products).where(eq(products.id, product_id));
        if (prod.length === 0) {
          throw new Error(`Produk dengan ID ${product_id} tidak ditemukan`);
        }

        const product = prod[0];

        // Validate stock
        if (product.stock < quantity) {
          throw new Error(`Stok untuk produk "${product.name}" tidak cukup. Tersedia: ${product.stock}, diminta: ${quantity}`);
        }

        const purchasePriceSnapshot = product.purchasePrice;
        const subtotal = quantity * unit_price;
        const profit = (unit_price - purchasePriceSnapshot) * quantity;

        totalAmount += subtotal;
        totalProfit += profit;

        processedItems.push({
          productId: product_id,
          quantity,
          unitPrice: unit_price,
          purchasePriceSnapshot,
          subtotal,
          profit,
          productName: product.name,
          currentStock: product.stock
        });
      }

      // 2. Generate Invoice Number
      const invoiceNumber = await generateInvoiceNumber();
      const transactionDate = new Date().toISOString();

      // 3. Insert transaction header
      const [insertedTxn] = await tx.insert(transactions).values({
        invoiceNumber,
        type: 'sale',
        transactionDate,
        totalAmount,
        totalProfit,
        customerName: customerName || 'Pelanggan Umum',
        notes
      }).returning();

      // 4. Insert items, update product stocks, and insert stock movements
      for (const item of processedItems) {
        await tx.insert(transactionItems).values({
          transactionId: insertedTxn.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          purchasePriceSnapshot: item.purchasePriceSnapshot,
          subtotal: item.subtotal,
          profit: item.profit
        });

        // Deduct stock
        const newStock = item.currentStock - item.quantity;
        await tx.update(products)
          .set({ stock: newStock })
          .where(eq(products.id, item.productId));

        // Create stock movement record
        await tx.insert(stockMovements).values({
          productId: item.productId,
          transactionId: insertedTxn.id,
          type: 'out',
          quantity: -item.quantity, // Negative for out
          stockBefore: item.currentStock,
          stockAfter: newStock,
          notes: `Penjualan ${invoiceNumber}`
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
