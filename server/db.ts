import { eq, and, gte, lte, desc, sql, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  products,
  InsertProduct,
  suppliers,
  InsertSupplier,
  invoiceEntries,
  InsertInvoiceEntry,
  invoiceEntryItems,
  InsertInvoiceEntryItem,
  sales,
  InsertSale,
  saleItems,
  InsertSaleItem,
  storeSettings,
  InsertStoreSettings,
  stockAlerts,
  InsertStockAlert,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER MANAGEMENT ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "sellerCode"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserBySellerCode(sellerCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.sellerCode, sellerCode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllSellers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserSellerCode(userId: number, sellerCode: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ sellerCode }).where(eq(users.id, userId));
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ============ STORE SETTINGS ============

export async function getStoreSettings() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(storeSettings).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertStoreSettings(settings: InsertStoreSettings) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getStoreSettings();
  if (existing) {
    await db.update(storeSettings).set(settings).where(eq(storeSettings.id, existing.id));
  } else {
    await db.insert(storeSettings).values(settings);
  }
}

// ============ PRODUCT MANAGEMENT ============

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(products).values(product);
  return result;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductByBarcode(barcode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.barcode, barcode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function searchProducts(searchTerm: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(
      sql`${products.name} LIKE ${`%${searchTerm}%`} OR ${products.barcode} LIKE ${`%${searchTerm}%`}`
    )
    .orderBy(asc(products.name));
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function updateProductStock(productId: number, quantity: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(products)
    .set({ stockQuantity: sql`${products.stockQuantity} + ${quantity}` })
    .where(eq(products.id, productId));
}

export async function getLowStockProducts() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(sql`${products.stockQuantity} <= ${products.minStockQuantity}`)
    .orderBy(asc(products.stockQuantity));
}

// ============ SUPPLIER MANAGEMENT ============

export async function createSupplier(supplier: InsertSupplier) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(suppliers).values(supplier);
  return result;
}

export async function getAllSuppliers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(suppliers).orderBy(asc(suppliers.name));
}

export async function getSupplierById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ INVOICE ENTRY MANAGEMENT ============

export async function createInvoiceEntry(invoice: InsertInvoiceEntry) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(invoiceEntries).values(invoice);
  return result;
}

export async function createInvoiceEntryItem(item: InsertInvoiceEntryItem) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(invoiceEntryItems).values(item);
  return result;
}

export async function getInvoiceEntriesWithDetails() {
  const db = await getDb();
  if (!db) return [];
  
  const entries = await db
    .select({
      id: invoiceEntries.id,
      invoiceNumber: invoiceEntries.invoiceNumber,
      supplierId: invoiceEntries.supplierId,
      supplierName: suppliers.name,
      entryDate: invoiceEntries.entryDate,
      totalValue: invoiceEntries.totalValue,
      createdById: invoiceEntries.createdById,
      createdByName: users.name,
      createdAt: invoiceEntries.createdAt,
    })
    .from(invoiceEntries)
    .leftJoin(suppliers, eq(invoiceEntries.supplierId, suppliers.id))
    .leftJoin(users, eq(invoiceEntries.createdById, users.id))
    .orderBy(desc(invoiceEntries.entryDate));
  
  return entries;
}

export async function getInvoiceEntryItems(invoiceEntryId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      id: invoiceEntryItems.id,
      productId: invoiceEntryItems.productId,
      productName: products.name,
      quantity: invoiceEntryItems.quantity,
      unitCost: invoiceEntryItems.unitCost,
      totalCost: invoiceEntryItems.totalCost,
    })
    .from(invoiceEntryItems)
    .leftJoin(products, eq(invoiceEntryItems.productId, products.id))
    .where(eq(invoiceEntryItems.invoiceEntryId, invoiceEntryId));
}

// ============ SALES MANAGEMENT ============

export async function createSale(sale: InsertSale) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(sales).values(sale);
  return result;
}

export async function createSaleItem(item: InsertSaleItem) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(saleItems).values(item);
  return result;
}

export async function getSaleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSaleBySaleCode(saleCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sales).where(eq(sales.saleCode, saleCode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSaleItems(saleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(saleItems).where(eq(saleItems.saleId, saleId));
}

export async function getSalesWithDetails(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db
    .select({
      id: sales.id,
      saleCode: sales.saleCode,
      sellerId: sales.sellerId,
      sellerName: users.name,
      sellerCode: users.sellerCode,
      totalAmount: sales.totalAmount,
      paymentMethod: sales.paymentMethod,
      saleDate: sales.saleDate,
      createdAt: sales.createdAt,
    })
    .from(sales)
    .leftJoin(users, eq(sales.sellerId, users.id))
    .$dynamic();
  
  if (startDate && endDate) {
    query = query.where(and(gte(sales.saleDate, startDate), lte(sales.saleDate, endDate)));
  }
  
  return query.orderBy(desc(sales.saleDate));
}

export async function getSalesByPeriod(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(sales)
    .where(and(gte(sales.saleDate, startDate), lte(sales.saleDate, endDate)))
    .orderBy(desc(sales.saleDate));
}

export async function getSalesBySeller(sellerId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(sales.sellerId, sellerId)];
  
  if (startDate && endDate) {
    conditions.push(gte(sales.saleDate, startDate));
    conditions.push(lte(sales.saleDate, endDate));
  }
  
  return db
    .select()
    .from(sales)
    .where(and(...conditions))
    .orderBy(desc(sales.saleDate));
}

// ============ STOCK ALERTS ============

export async function createStockAlert(alert: InsertStockAlert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(stockAlerts).values(alert);
  return result;
}

export async function getUnsentStockAlerts() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      id: stockAlerts.id,
      productId: stockAlerts.productId,
      productName: products.name,
      stockQuantity: stockAlerts.stockQuantity,
      minStockQuantity: products.minStockQuantity,
      alertDate: stockAlerts.alertDate,
    })
    .from(stockAlerts)
    .leftJoin(products, eq(stockAlerts.productId, products.id))
    .where(eq(stockAlerts.notificationSent, false))
    .orderBy(desc(stockAlerts.alertDate));
}

export async function markStockAlertAsSent(alertId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(stockAlerts).set({ notificationSent: true }).where(eq(stockAlerts.id, alertId));
}
