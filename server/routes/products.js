import express from 'express';
import { db } from '../db/connection.js';
import { products, categories, stockMovements, transactionItems } from '../db/schema.js';
import { eq, and, like, or, sql, count } from 'drizzle-orm';

const router = express.Router();

// Helper to auto-generate product code
const generateProductCode = async (categoryId) => {
  const cat = await db.select().from(categories).where(eq(categories.id, categoryId));
  const catName = cat[0]?.name || 'GEN';
  const prefix = catName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3).padEnd(3, 'X');
  
  // Find products with code format SPR-PREFIX-XXX
  const pattern = `SPR-${prefix}-%`;
  const existingCodes = await db.select({ code: products.code })
    .from(products)
    .where(like(products.code, pattern));
  
  let maxNum = 0;
  existingCodes.forEach(p => {
    const parts = p.code.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  });

  const nextNum = maxNum + 1;
  const seqStr = nextNum.toString().padStart(3, '0');
  return `SPR-${prefix}-${seqStr}`;
};

// GET all products with filter & pagination
router.get('/', async (req, res) => {
  const { search, category, vehicle_type, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  try {
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.code, `%${search}%`),
          like(products.brand, `%${search}%`)
        )
      );
    }

    if (category) {
      conditions.push(eq(products.categoryId, parseInt(category)));
    }

    if (vehicle_type) {
      conditions.push(eq(products.vehicleType, vehicle_type));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalCountResult = await db.select({ value: count() })
      .from(products)
      .where(whereClause);
    const total = totalCountResult[0]?.value || 0;

    // Get paginated products with category names
    // Drizzle innerJoin / leftJoin
    const list = await db.select({
      id: products.id,
      code: products.code,
      name: products.name,
      categoryId: products.categoryId,
      categoryName: categories.name,
      vehicleType: products.vehicleType,
      brand: products.brand,
      stock: products.stock,
      minStock: products.minStock,
      purchasePrice: products.purchasePrice,
      sellingPrice: products.sellingPrice,
      unit: products.unit,
      location: products.location,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(whereClause)
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

// GET single product detail
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const list = await db.select({
      id: products.id,
      code: products.code,
      name: products.name,
      categoryId: products.categoryId,
      categoryName: categories.name,
      vehicleType: products.vehicleType,
      brand: products.brand,
      stock: products.stock,
      minStock: products.minStock,
      purchasePrice: products.purchasePrice,
      sellingPrice: products.sellingPrice,
      unit: products.unit,
      location: products.location,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, parseInt(id)));

    if (list.length === 0) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
    }
    res.json({ success: true, data: list[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new product
router.post('/', async (req, res) => {
  const { 
    name, 
    categoryId, 
    vehicleType, 
    brand, 
    stock = 0, 
    minStock = 5, 
    purchasePrice = 0, 
    sellingPrice = 0, 
    unit = 'pcs', 
    location 
  } = req.body;

  if (!name || !categoryId) {
    return res.status(400).json({ success: false, error: 'Nama produk dan Kategori harus diisi' });
  }

  try {
    // Generate unique code automatically
    const code = await generateProductCode(parseInt(categoryId));

    const [inserted] = await db.insert(products).values({
      code,
      name,
      categoryId: parseInt(categoryId),
      vehicleType,
      brand,
      stock: parseInt(stock),
      minStock: parseInt(minStock),
      purchasePrice: parseInt(purchasePrice),
      sellingPrice: parseInt(sellingPrice),
      unit,
      location
    }).returning();

    // If initial stock is greater than 0, create stock movement
    if (parseInt(stock) > 0) {
      await db.insert(stockMovements).values({
        productId: inserted.id,
        type: 'in',
        quantity: parseInt(stock),
        stockBefore: 0,
        stockAfter: parseInt(stock),
        notes: 'Stok awal produk baru'
      });
    }

    res.status(201).json({ success: true, data: inserted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const productId = parseInt(id);
  const { 
    name, 
    categoryId, 
    vehicleType, 
    brand, 
    minStock, 
    purchasePrice, 
    sellingPrice, 
    unit, 
    location 
  } = req.body;

  if (!name || !categoryId) {
    return res.status(400).json({ success: false, error: 'Nama produk dan Kategori harus diisi' });
  }

  try {
    // Check if product exists
    const existing = await db.select().from(products).where(eq(products.id, productId));
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
    }

    // Code is immutable and generated on creation. Stock is updated via adjustments or transactions.
    const [updated] = await db.update(products).set({
      name,
      categoryId: parseInt(categoryId),
      vehicleType,
      brand,
      minStock: parseInt(minStock),
      purchasePrice: parseInt(purchasePrice),
      sellingPrice: parseInt(sellingPrice),
      unit,
      location,
      updatedAt: new Date().toISOString()
    })
    .where(eq(products.id, productId))
    .returning();

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const productId = parseInt(id);

  try {
    // Check if product has related transaction items
    const txnItemCount = await db.select({ value: count() })
      .from(transactionItems)
      .where(eq(transactionItems.productId, productId));

    const countVal = txnItemCount[0]?.value || 0;
    if (countVal > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Produk tidak dapat dihapus karena sudah memiliki ${countVal} catatan transaksi.` 
      });
    }

    // Delete related stock movements first to preserve FK integrity if any
    await db.delete(stockMovements).where(eq(stockMovements.productId, productId));

    const [deleted] = await db.delete(products)
      .where(eq(products.id, productId))
      .returning();

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
    }

    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
