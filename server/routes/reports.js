import express from 'express';
import { db } from '../db/connection.js';
import { transactions, transactionItems, products } from '../db/schema.js';
import { eq, and, like, gte, lte, sql, desc } from 'drizzle-orm';

const router = express.Router();

// GET daily sales report (?date=YYYY-MM-DD)
router.get('/daily', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ success: false, error: 'Parameter date wajib diisi (Format: YYYY-MM-DD)' });
  }

  try {
    const pattern = `${date}%`;
    const salesList = await db.select()
      .from(transactions)
      .where(and(eq(transactions.type, 'sale'), like(transactions.transactionDate, pattern)));

    let totalTransactions = salesList.length;
    let totalRevenue = 0;
    let totalProfit = 0;

    const txnIds = salesList.map(s => {
      totalRevenue += s.totalAmount;
      totalProfit += s.totalProfit;
      return s.id;
    });

    let itemsSold = 0;
    if (txnIds.length > 0) {
      // Sum quantities in transactionItems
      const itemsResult = await db.select({
        qtySum: sql`SUM(${transactionItems.quantity})`
      })
      .from(transactionItems)
      .where(sql`${transactionItems.transactionId} IN (${sql.raw(txnIds.join(','))})`);

      itemsSold = parseInt(itemsResult[0]?.qtySum || 0, 10);
    }

    const totalCost = totalRevenue - totalProfit;

    res.json({
      success: true,
      data: {
        date,
        totalTransactions,
        totalRevenue,
        totalCost,
        totalProfit,
        itemsSold,
        transactions: salesList
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET monthly sales report (?month=YYYY-MM)
router.get('/monthly', async (req, res) => {
  const { month } = req.query; // Format: YYYY-MM
  if (!month) {
    return res.status(400).json({ success: false, error: 'Parameter month wajib diisi (Format: YYYY-MM)' });
  }

  try {
    const pattern = `${month}%`;
    
    // Fetch all sales for this month
    const salesList = await db.select()
      .from(transactions)
      .where(and(eq(transactions.type, 'sale'), like(transactions.transactionDate, pattern)));

    let totalTransactions = salesList.length;
    let totalRevenue = 0;
    let totalProfit = 0;

    salesList.forEach(s => {
      totalRevenue += s.totalAmount;
      totalProfit += s.totalProfit;
    });

    // Group sales by date to plot charts
    // Grouping by extracting substr YYYY-MM-DD
    const dailyStats = await db.select({
      date: sql`SUBSTR(${transactions.transactionDate}, 1, 10)`,
      revenue: sql`SUM(${transactions.totalAmount})`,
      profit: sql`SUM(${transactions.totalProfit})`,
      count: sql`COUNT(${transactions.id})`
    })
    .from(transactions)
    .where(and(eq(transactions.type, 'sale'), like(transactions.transactionDate, pattern)))
    .groupBy(sql`SUBSTR(${transactions.transactionDate}, 1, 10)`);

    res.json({
      success: true,
      data: {
        month,
        totalTransactions,
        totalRevenue,
        totalProfit,
        totalCost: totalRevenue - totalProfit,
        dailyStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET profit & loss report (?from=YYYY-MM-DD&to=YYYY-MM-DD)
router.get('/profit', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ success: false, error: 'Parameter from dan to wajib diisi (Format: YYYY-MM-DD)' });
  }

  try {
    // Sales sum
    const salesSum = await db.select({
      revenue: sql`SUM(${transactions.totalAmount})`,
      profit: sql`SUM(${transactions.totalProfit})`
    })
    .from(transactions)
    .where(and(
      eq(transactions.type, 'sale'),
      gte(transactions.transactionDate, from),
      lte(transactions.transactionDate, `${to}T23:59:59.999Z`)
    ));

    // Purchases sum (cost of restocking)
    const purchasesSum = await db.select({
      cost: sql`SUM(${transactions.totalAmount})`
    })
    .from(transactions)
    .where(and(
      eq(transactions.type, 'purchase'),
      gte(transactions.transactionDate, from),
      lte(transactions.transactionDate, `${to}T23:59:59.999Z`)
    ));

    const totalRevenue = parseInt(salesSum[0]?.revenue || 0, 10);
    const totalProfit = parseInt(salesSum[0]?.profit || 0, 10);
    const totalCostOfGoodsSold = totalRevenue - totalProfit;
    const totalPurchaseExpense = parseInt(purchasesSum[0]?.cost || 0, 10);

    res.json({
      success: true,
      data: {
        from,
        to,
        totalRevenue,
        totalCostOfGoodsSold,
        totalProfit, // Net profit from sales
        totalPurchaseExpense // Cash outflow for restok
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET top selling products (?period=month&limit=10)
router.get('/top-products', async (req, res) => {
  const { limit = 10, period = 'month' } = req.query;
  try {
    let dateCondition = undefined;
    if (period === 'month') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      dateCondition = like(transactions.transactionDate, `${year}-${month}%`);
    }

    const conditions = [
      eq(transactions.type, 'sale'),
      eq(transactionItems.transactionId, transactions.id),
      eq(transactionItems.productId, products.id)
    ];
    if (dateCondition) {
      conditions.push(dateCondition);
    }

    const topList = await db.select({
      id: products.id,
      code: products.code,
      name: products.name,
      unit: products.unit,
      totalQuantity: sql`SUM(${transactionItems.quantity})`,
      totalRevenue: sql`SUM(${transactionItems.subtotal})`,
      totalProfit: sql`SUM(${transactionItems.profit})`
    })
    .from(transactionItems)
    .leftJoin(transactions, eq(transactionItems.transactionId, transactions.id))
    .leftJoin(products, eq(transactionItems.productId, products.id))
    .where(dateCondition ? and(eq(transactions.type, 'sale'), dateCondition) : eq(transactions.type, 'sale'))
    .groupBy(products.id)
    .orderBy(desc(sql`SUM(${transactionItems.quantity})`))
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: topList
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
