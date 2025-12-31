import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { nanoid } from "nanoid";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ USER & SELLER MANAGEMENT ============
  users: router({
    getAll: adminProcedure.query(async () => {
      return await db.getAllSellers();
    }),
    
    updateSellerCode: adminProcedure
      .input(z.object({ userId: z.number(), sellerCode: z.string() }))
      .mutation(async ({ input }) => {
        await db.updateUserSellerCode(input.userId, input.sellerCode);
        return { success: true };
      }),
    
    updateRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),
    
    getBySellerCode: protectedProcedure
      .input(z.object({ sellerCode: z.string() }))
      .query(async ({ input }) => {
        return await db.getUserBySellerCode(input.sellerCode);
      }),
  }),

  // ============ STORE SETTINGS ============
  store: router({
    getSettings: protectedProcedure.query(async () => {
      return await db.getStoreSettings();
    }),
    
    updateSettings: adminProcedure
      .input(z.object({
        companyName: z.string(),
        cnpjCpf: z.string(),
        address: z.string(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertStoreSettings(input);
        return { success: true };
      }),
  }),

  // ============ PRODUCT MANAGEMENT ============
  products: router({
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        barcode: z.string(),
        unitPrice: z.string(),
        stockQuantity: z.number(),
        minStockQuantity: z.number().default(10),
        brand: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createProduct(input);
        return { success: true };
      }),
    
    getAll: protectedProcedure.query(async () => {
      return await db.getAllProducts();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    
    getByBarcode: protectedProcedure
      .input(z.object({ barcode: z.string() }))
      .query(async ({ input }) => {
        return await db.getProductByBarcode(input.barcode);
      }),
    
    search: protectedProcedure
      .input(z.object({ searchTerm: z.string() }))
      .query(async ({ input }) => {
        return await db.searchProducts(input.searchTerm);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        unitPrice: z.string().optional(),
        stockQuantity: z.number().optional(),
        minStockQuantity: z.number().optional(),
        brand: z.string().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),
    
    getLowStock: adminProcedure.query(async () => {
      return await db.getLowStockProducts();
    }),
  }),

  // ============ SUPPLIER MANAGEMENT ============
  suppliers: router({
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        cnpjCpf: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createSupplier(input);
        return { success: true };
      }),
    
    getAll: protectedProcedure.query(async () => {
      return await db.getAllSuppliers();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSupplierById(input.id);
      }),
  }),

  // ============ INVOICE ENTRY MANAGEMENT ============
  invoices: router({
    create: adminProcedure
      .input(z.object({
        invoiceNumber: z.string(),
        supplierId: z.number(),
        entryDate: z.date(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          unitCost: z.string(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const totalValue = input.items.reduce((sum, item) => {
          return sum + parseFloat(item.unitCost) * item.quantity;
        }, 0);

        const invoiceResult = await db.createInvoiceEntry({
          invoiceNumber: input.invoiceNumber,
          supplierId: input.supplierId,
          entryDate: input.entryDate,
          totalValue: totalValue.toFixed(2),
          createdById: ctx.user.id,
        });

        const invoiceId = Number((invoiceResult as any)?.insertId);

        for (const item of input.items) {
          const totalCost = parseFloat(item.unitCost) * item.quantity;
          
          await db.createInvoiceEntryItem({
            invoiceEntryId: invoiceId,
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: totalCost.toFixed(2),
          });

          await db.updateProductStock(item.productId, item.quantity);
        }

        return { success: true, invoiceId };
      }),
    
    getAll: protectedProcedure.query(async () => {
      return await db.getInvoiceEntriesWithDetails();
    }),
    
    getItems: protectedProcedure
      .input(z.object({ invoiceEntryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getInvoiceEntryItems(input.invoiceEntryId);
      }),
  }),

  // ============ SALES MANAGEMENT ============
  sales: router({
    create: protectedProcedure
      .input(z.object({
        sellerId: z.number(),
        items: z.array(z.object({
          productId: z.number(),
          productName: z.string(),
          quantity: z.number(),
          unitPrice: z.string(),
        })),
        paymentMethod: z.enum(["cash", "pix", "debit", "credit"]),
        amountPaid: z.string().optional(),
        stripePaymentIntentId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const totalAmount = input.items.reduce((sum, item) => {
          return sum + parseFloat(item.unitPrice) * item.quantity;
        }, 0);

        const changeAmount = input.amountPaid 
          ? parseFloat(input.amountPaid) - totalAmount 
          : 0;

        const now = new Date();
        const saleCode = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()}-${nanoid(6).toUpperCase()}`;

        const saleResult = await db.createSale({
          saleCode,
          sellerId: input.sellerId,
          totalAmount: totalAmount.toFixed(2),
          paymentMethod: input.paymentMethod as "cash" | "debit" | "credit" | "pix",
          amountPaid: input.amountPaid,
          changeAmount: changeAmount > 0 ? changeAmount.toFixed(2) : "0.00",
          stripePaymentIntentId: input.stripePaymentIntentId,
          saleDate: now,
        });

        const saleId = Number((saleResult as any)?.insertId);

        for (const item of input.items) {
          const totalPrice = parseFloat(item.unitPrice) * item.quantity;
          
          await db.createSaleItem({
            saleId,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: totalPrice.toFixed(2),
          });

          await db.updateProductStock(item.productId, -item.quantity);
          
          const product = await db.getProductById(item.productId);
          if (product && product.stockQuantity - item.quantity <= product.minStockQuantity) {
            await db.createStockAlert({
              productId: item.productId,
              alertDate: now,
              stockQuantity: product.stockQuantity - item.quantity,
              notificationSent: false,
            });
          }
        }

        return { success: true, saleId, saleCode };
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const sale = await db.getSaleById(input.id);
        if (!sale) return null;
        
        const items = await db.getSaleItems(input.id);
        return { ...sale, items };
      }),
    
    getBySaleCode: protectedProcedure
      .input(z.object({ saleCode: z.string() }))
      .query(async ({ input }) => {
        const sale = await db.getSaleBySaleCode(input.saleCode);
        if (!sale) return null;
        
        const items = await db.getSaleItems(sale.id);
        return { ...sale, items };
      }),
    
    getAll: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getSalesWithDetails(input.startDate, input.endDate);
      }),
    
    generatePixQrCode: protectedProcedure
      .input(z.object({
        amount: z.number(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Gerar QR Code para Pix
        // Este é um placeholder - em produção, integrar com API de Pix do Stripe ou banco
        const pixData = `00020126580014br.gov.bcb.pix0136${nanoid(32)}520400005303986540510.005802BR5913MODERN HOUSE6009SAO PAULO62410503***63041D3D`;
        return { pixData, amount: input.amount, success: true };
      }),
    
    getBySeller: protectedProcedure
      .input(z.object({
        sellerId: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getSalesBySeller(input.sellerId, input.startDate, input.endDate);
      }),
  }),

  // ============ STOCK ALERTS ============
  alerts: router({
    getUnsent: adminProcedure.query(async () => {
      return await db.getUnsentStockAlerts();
    }),
    
    markAsSent: adminProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markStockAlertAsSent(input.alertId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
