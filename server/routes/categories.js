import express from 'express';
import { db } from '../db/connection.js';
import { categories, products } from '../db/schema.js';
import { eq, count } from 'drizzle-orm';

const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
  try {
    const list = await db.select().from(categories);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new category
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Nama kategori harus diisi' });
  }
  try {
    const [inserted] = await db.insert(categories).values({ name, description }).returning();
    res.status(201).json({ success: true, data: inserted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update category
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Nama kategori harus diisi' });
  }
  try {
    const [updated] = await db.update(categories)
      .set({ name, description })
      .where(eq(categories.id, parseInt(id)))
      .returning();
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Kategori tidak ditemukan' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const categoryId = parseInt(id);
  try {
    // Check if there are related products
    const productCountResult = await db.select({ value: count() })
      .from(products)
      .where(eq(products.categoryId, categoryId));
    
    const countVal = productCountResult[0]?.value || 0;
    if (countVal > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Kategori tidak dapat dihapus karena masih digunakan oleh ${countVal} produk.` 
      });
    }

    const [deleted] = await db.delete(categories)
      .where(eq(categories.id, categoryId))
      .returning();
      
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Kategori tidak ditemukan' });
    }
    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
