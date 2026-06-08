import { db } from './connection.js';
import { categories, products, transactions, transactionItems, stockMovements } from './schema.js';
import { count, eq } from 'drizzle-orm';

const defaultCategories = [
  { name: 'Oli', description: 'Oli mesin dan transmisi kendaraan' },
  { name: 'Ban', description: 'Ban luar dan ban dalam motor/mobil' },
  { name: 'Aki', description: 'Aki basah dan aki kering bebas perawatan' },
  { name: 'Busi', description: 'Busi standar dan busi iridium' },
  { name: 'Kampas Rem', description: 'Kampas rem cakram dan tromol' },
  { name: 'Rantai & Gir', description: 'Rantai dan gir paket motor roda dua' },
  { name: 'Filter', description: 'Filter udara, filter oli, dan filter bensin' },
  { name: 'Lampu', description: 'Lampu halogen, LED, dan bohlam standar' }
];

const defaultProducts = [
  // Oli
  { categoryName: 'Oli', code: 'SPR-OLI-001', name: 'Oli Yamalube Super Matic 1L 10W-40', brand: 'Yamalube', vehicleType: 'motor', stock: 45, minStock: 10, purchasePrice: 42000, sellingPrice: 50000, unit: 'liter', location: 'Rak A1' },
  { categoryName: 'Oli', code: 'SPR-OLI-002', name: 'Oli Shell Advance AX7 10W-30 0.8L', brand: 'Shell', vehicleType: 'motor', stock: 30, minStock: 10, purchasePrice: 38000, sellingPrice: 45000, unit: 'liter', location: 'Rak A2' },
  { categoryName: 'Oli', code: 'SPR-OLI-003', name: 'Oli Pertamina Prima XP 10W-40 4L', brand: 'Pertamina', vehicleType: 'mobil', stock: 12, minStock: 3, purchasePrice: 135000, sellingPrice: 165000, unit: 'box', location: 'Rak A3' },
  
  // Ban
  { categoryName: 'Ban', code: 'SPR-BAN-001', name: 'Ban FDR Sport XR Evo 90/80-14 Tubeless', brand: 'FDR', vehicleType: 'motor', stock: 18, minStock: 5, purchasePrice: 180000, sellingPrice: 215000, unit: 'pcs', location: 'Rak B1' },
  { categoryName: 'Ban', code: 'SPR-BAN-002', name: 'Ban IRC Exato NR88 80/90-14 Tubeless', brand: 'IRC', vehicleType: 'motor', stock: 22, minStock: 5, purchasePrice: 150000, sellingPrice: 180000, unit: 'pcs', location: 'Rak B2' },
  { categoryName: 'Ban', code: 'SPR-BAN-003', name: 'Ban Dunlop Enasave EC300+ 185/65 R15', brand: 'Dunlop', vehicleType: 'mobil', stock: 8, minStock: 2, purchasePrice: 580000, sellingPrice: 695000, unit: 'pcs', location: 'Rak B3' },

  // Aki
  { categoryName: 'Aki', code: 'SPR-AKI-001', name: 'Aki GS Astra MF GTZ5S 12V', brand: 'GS Astra', vehicleType: 'motor', stock: 15, minStock: 4, purchasePrice: 195000, sellingPrice: 235000, unit: 'pcs', location: 'Rak C1' },
  { categoryName: 'Aki', code: 'SPR-AKI-002', name: 'Aki Motobatt Gel MTZ5S Bebas Perawatan', brand: 'Motobatt', vehicleType: 'motor', stock: 12, minStock: 4, purchasePrice: 185000, sellingPrice: 220000, unit: 'pcs', location: 'Rak C2' },

  // Busi
  { categoryName: 'Busi', code: 'SPR-BUS-001', name: 'Busi NGK Standar C7HSA', brand: 'NGK', vehicleType: 'motor', stock: 120, minStock: 20, purchasePrice: 11000, sellingPrice: 16000, unit: 'pcs', location: 'Rak D1' },
  { categoryName: 'Busi', code: 'SPR-BUS-002', name: 'Busi Denso U20EPR9', brand: 'Denso', vehicleType: 'motor', stock: 90, minStock: 20, purchasePrice: 12000, sellingPrice: 18000, unit: 'pcs', location: 'Rak D2' },

  // Kampas Rem
  { categoryName: 'Kampas Rem', code: 'SPR-KAM-001', name: 'Kampas Rem Depan Honda Beat AHM', brand: 'AHM', vehicleType: 'motor', stock: 40, minStock: 10, purchasePrice: 26000, sellingPrice: 35000, unit: 'set', location: 'Rak E1' },
  { categoryName: 'Kampas Rem', code: 'SPR-KAM-002', name: 'Kampas Rem Belakang Vario KPB', brand: 'AHM', vehicleType: 'motor', stock: 35, minStock: 10, purchasePrice: 28000, sellingPrice: 38000, unit: 'set', location: 'Rak E2' },
  { categoryName: 'Kampas Rem', code: 'SPR-KAM-003', name: 'Brake Pad Kampas Rem Depan Avanza Bendix', brand: 'Bendix', vehicleType: 'mobil', stock: 10, minStock: 3, purchasePrice: 190000, sellingPrice: 245000, unit: 'set', location: 'Rak E3' },

  // Rantai & Gir
  { categoryName: 'Rantai & Gir', code: 'SPR-RAN-001', name: 'Rantai & Gir Set Supra Fit Federal', brand: 'Federal', vehicleType: 'motor', stock: 15, minStock: 4, purchasePrice: 110000, sellingPrice: 140000, unit: 'set', location: 'Rak F1' },
  { categoryName: 'Rantai & Gir', code: 'SPR-RAN-002', name: 'Gir Depan Sinnob Vixion 14T', brand: 'Sinnob', vehicleType: 'motor', stock: 8, minStock: 2, purchasePrice: 65000, sellingPrice: 85000, unit: 'pcs', location: 'Rak F2' },

  // Filter
  { categoryName: 'Filter', code: 'SPR-FIL-001', name: 'Filter Oli Avanza Daihatsu Astra', brand: 'Astra', vehicleType: 'mobil', stock: 30, minStock: 5, purchasePrice: 24000, sellingPrice: 35000, unit: 'pcs', location: 'Rak G1' },
  { categoryName: 'Filter', code: 'SPR-FIL-002', name: 'Filter Udara Honda Beat FI AHM', brand: 'AHM', vehicleType: 'motor', stock: 25, minStock: 5, purchasePrice: 32000, sellingPrice: 45000, unit: 'pcs', location: 'Rak G2' },

  // Lampu
  { categoryName: 'Lampu', code: 'SPR-LAM-001', name: 'Lampu Depan LED Osram H6 M5', brand: 'Osram', vehicleType: 'motor', stock: 35, minStock: 5, purchasePrice: 42000, sellingPrice: 55000, unit: 'pcs', location: 'Rak H1' },
  { categoryName: 'Lampu', code: 'SPR-LAM-002', name: 'Bohlam Lampu Rem Mobil Philips 12V', brand: 'Philips', vehicleType: 'universal', stock: 50, minStock: 10, purchasePrice: 8000, sellingPrice: 12000, unit: 'pcs', location: 'Rak H2' }
];

async function seed() {
  console.log('Clearing database for clean seed simulation...');
  try {
    // Delete existing records to refresh the database
    await db.delete(stockMovements);
    await db.delete(transactionItems);
    await db.delete(transactions);
    await db.delete(products);
    await db.delete(categories);
    
    console.log('Seeding categories...');
    const insertedCategories = [];
    for (const cat of defaultCategories) {
      const [inserted] = await db.insert(categories).values(cat).returning();
      insertedCategories.push(inserted);
    }

    console.log('Seeding products...');
    const categoryMap = {};
    insertedCategories.forEach(c => {
      categoryMap[c.name] = c.id;
    });

    const insertedProducts = [];
    for (const p of defaultProducts) {
      const catId = categoryMap[p.categoryName];
      const { categoryName, ...productData } = p;
      const [inserted] = await db.insert(products).values({
        ...productData,
        categoryId: catId
      }).returning();
      insertedProducts.push(inserted);

      // Create stock movement record for initial stock
      if (inserted.stock > 0) {
        await db.insert(stockMovements).values({
          productId: inserted.id,
          type: 'in',
          quantity: inserted.stock,
          stockBefore: 0,
          stockAfter: inserted.stock,
          notes: 'Stok awal simulasi'
        });
      }
    }

    console.log('Seeding historical transactions...');
    
    // Generate dates for the past 7 days (June 1st to June 8th, 2026)
    const baseDate = new Date('2026-06-01T08:00:00.000Z');
    
    // Simple helper to pick random items
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    // We will generate 2-3 sales transactions per day and 1 purchase transaction every 2 days
    let invoiceCounter = 1;
    let purchaseCounter = 1;

    for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
      const currentDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const dateStr = currentDate.toISOString().split('T')[0].replace(/-/g, '');
      
      // 1. Seed some Purchases (Restocking) every 2 days
      if (dayOffset % 2 === 0) {
        const pTxnDate = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000); // 10:00 AM
        const numItems = getRandomInt(1, 3);
        const purchaseItemsSelected = [];
        let totalAmount = 0;

        for (let i = 0; i < numItems; i++) {
          const randProd = insertedProducts[getRandomInt(0, insertedProducts.length - 1)];
          if (purchaseItemsSelected.some(item => item.id === randProd.id)) continue;
          
          const qty = getRandomInt(5, 15);
          const subtotal = qty * randProd.purchasePrice;
          totalAmount += subtotal;
          
          purchaseItemsSelected.push({
            productId: randProd.id,
            quantity: qty,
            unitPrice: randProd.purchasePrice,
            subtotal,
            prodRef: randProd
          });
        }

        if (purchaseItemsSelected.length > 0) {
          const purchaseNo = String(purchaseCounter++).padStart(3, '0');
          const [txnHeader] = await db.insert(transactions).values({
            invoiceNumber: `PRC-${dateStr}-${purchaseNo}`,
            type: 'purchase',
            transactionDate: pTxnDate.toISOString(),
            totalAmount,
            totalProfit: 0,
            supplierName: ['PT Astra Otoparts', 'Distributor Utama Sparepart', 'IndoParts Supplier'][getRandomInt(0, 2)],
            notes: 'Pembelian restok barang mingguan'
          }).returning();

          for (const item of purchaseItemsSelected) {
            await db.insert(transactionItems).values({
              transactionId: txnHeader.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              purchasePriceSnapshot: item.unitPrice,
              subtotal: item.subtotal,
              profit: 0
            });

            // Adjust stock
            const prevStock = item.prodRef.stock;
            const newStock = prevStock + item.quantity;
            item.prodRef.stock = newStock; // Update in-memory for subsequent steps

            await db.update(products).set({ stock: newStock }).where(eq(products.id, item.productId));

            await db.insert(stockMovements).values({
              productId: item.productId,
              transactionId: txnHeader.id,
              type: 'in',
              quantity: item.quantity,
              stockBefore: prevStock,
              stockAfter: newStock,
              notes: `Restok Pembelian ${txnHeader.invoiceNumber}`
            });
          }
        }
      }

      // 2. Seed 2-4 Sales per day
      const numSales = getRandomInt(2, 4);
      for (let saleIdx = 0; saleIdx < numSales; saleIdx++) {
        // Different times of day
        const sTxnDate = new Date(currentDate.getTime() + (4 + saleIdx * 3) * 60 * 60 * 1000); 
        const numItems = getRandomInt(1, 4);
        const saleItemsSelected = [];
        let totalAmount = 0;
        let totalProfit = 0;

        for (let i = 0; i < numItems; i++) {
          const randProd = insertedProducts[getRandomInt(0, insertedProducts.length - 1)];
          if (saleItemsSelected.some(item => item.id === randProd.id)) continue;
          if (randProd.stock < 3) continue; // Skip if stock is too low to sell

          const qty = getRandomInt(1, 3);
          const subtotal = qty * randProd.sellingPrice;
          const profit = (randProd.sellingPrice - randProd.purchasePrice) * qty;
          
          totalAmount += subtotal;
          totalProfit += profit;
          
          saleItemsSelected.push({
            productId: randProd.id,
            quantity: qty,
            unitPrice: randProd.sellingPrice,
            purchasePriceSnapshot: randProd.purchasePrice,
            subtotal,
            profit,
            prodRef: randProd
          });
        }

        if (saleItemsSelected.length > 0) {
          const invoiceNo = String(invoiceCounter++).padStart(3, '0');
          const customer = ['Budi', 'Joko', 'Siti', 'Ani', 'Andi', 'Rudi', ''][getRandomInt(0, 6)];
          const [txnHeader] = await db.insert(transactions).values({
            invoiceNumber: `INV-${dateStr}-${invoiceNo}`,
            type: 'sale',
            transactionDate: sTxnDate.toISOString(),
            totalAmount,
            totalProfit,
            customerName: customer || 'Pelanggan Umum',
            notes: ['Lunas', 'Ganti oli rutin', 'Service motor berkala', ''][getRandomInt(0, 3)]
          }).returning();

          for (const item of saleItemsSelected) {
            await db.insert(transactionItems).values({
              transactionId: txnHeader.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              purchasePriceSnapshot: item.purchasePriceSnapshot,
              subtotal: item.subtotal,
              profit: item.profit
            });

            // Adjust stock
            const prevStock = item.prodRef.stock;
            const newStock = prevStock - item.quantity;
            item.prodRef.stock = newStock; // Update in-memory

            await db.update(products).set({ stock: newStock }).where(eq(products.id, item.productId));

            await db.insert(stockMovements).values({
              productId: item.productId,
              transactionId: txnHeader.id,
              type: 'out',
              quantity: -item.quantity,
              stockBefore: prevStock,
              stockAfter: newStock,
              notes: `Penjualan ${txnHeader.invoiceNumber}`
            });
          }
        }
      }
    }

    console.log('Database seeded successfully with realistic products, sales, and purchases!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
