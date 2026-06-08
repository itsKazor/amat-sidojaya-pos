import express from 'express';
import { db } from '../db/connection.js';
import { products, categories, stockMovements } from '../db/schema.js';
import { eq, and, sql, desc, lte } from 'drizzle-orm';

const router = express.Router();

// GET stock overview with filter options (?status=low)
router.get('/', async (req, res) => {
  const { status } = req.query;
  try {
    const conditions = [];
    if (status === 'low') {
      conditions.push(sql`${products.stock} <= ${products.minStock}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const list = await db.select({
      id: products.id,
      code: products.code,
      name: products.name,
      categoryName: categories.name,
      stock: products.stock,
      minStock: products.minStock,
      unit: products.unit,
      location: products.location
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(whereClause)
    .orderBy(products.stock);

    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET list of critical low stock items
router.get('/low', async (req, res) => {
  try {
    const list = await db.select({
      id: products.id,
      code: products.code,
      name: products.name,
      stock: products.stock,
      minStock: products.minStock,
      unit: products.unit
    })
    .from(products)
    .where(sql`${products.stock} <= ${products.minStock}`)
    .orderBy(products.stock);

    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET stock movements history for 1 product
router.get('/movements/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const list = await db.select()
      .from(stockMovements)
      .where(eq(stockMovements.productId, parseInt(productId)))
      .orderBy(desc(stockMovements.createdAt), desc(stockMovements.id));

    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST stock adjustment (stock opname)
router.post('/adjustment', async (req, res) => {
  const { productId, newStock, notes } = req.body;

  if (productId === undefined || newStock === undefined || newStock < 0) {
    return res.status(400).json({ success: false, error: 'ID produk dan jumlah stok baru harus diisi dengan benar' });
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Fetch current stock
      const prod = await tx.select().from(products).where(eq(products.id, parseInt(productId)));
      if (prod.length === 0) {
        throw new Error('Produk tidak ditemukan');
      }

      const product = prod[0];
      const currentStock = product.stock;
      const difference = parseInt(newStock) - currentStock;

      if (difference === 0) {
        return product; // No changes needed
      }

      // 2. Update stock in products table
      const [updated] = await tx.update(products)
        .set({ stock: parseInt(newStock) })
        .where(eq(products.id, parseInt(productId)))
        .returning();

      // 3. Log to stock_movements
      await tx.insert(stockMovements).values({
        productId: parseInt(productId),
        type: 'adjustment',
        quantity: difference,
        stockBefore: currentStock,
        stockAfter: parseInt(newStock),
        notes: notes || `Stok opname penyesuaian manual (selisih: ${difference > 0 ? '+' : ''}${difference})`
      });

      return updated;
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
