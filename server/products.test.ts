import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@modernhouse.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    sellerCode: "ADM001",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "seller-user",
    email: "seller@modernhouse.com",
    name: "Seller User",
    loginMethod: "manus",
    role: "user",
    sellerCode: "V001",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("products router", () => {
  it("should allow admin to create product", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.create({
      name: "Cadeira Teste",
      description: "Cadeira de escritório para teste",
      barcode: `TEST${Date.now()}`,
      unitPrice: "299.90",
      stockQuantity: 50,
      minStockQuantity: 10,
      brand: "Modern House",
      category: "Móveis",
    });

    expect(result).toEqual({ success: true });
  });

  it("should prevent non-admin from creating product", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.products.create({
        name: "Cadeira Teste",
        barcode: `TEST${Date.now()}`,
        unitPrice: "299.90",
        stockQuantity: 50,
      })
    ).rejects.toThrow("Admin access required");
  });

  it("should allow authenticated users to list products", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.getAll();

    expect(Array.isArray(products)).toBe(true);
  });

  it("should allow searching products by name or barcode", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.products.search({ searchTerm: "Cadeira" });

    expect(Array.isArray(results)).toBe(true);
  });
});

describe("store settings", () => {
  it("should allow admin to update store settings", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.store.updateSettings({
      companyName: "Modern House Comércio Ltda",
      cnpjCpf: "12.345.678/0001-90",
      address: "Rua Teste, 123 - Centro - São Paulo - SP - CEP 01000-000",
      phone: "(11) 1234-5678",
      email: "contato@modernhouse.com",
    });

    expect(result).toEqual({ success: true });
  });

  it("should allow any authenticated user to view store settings", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const settings = await caller.store.getSettings();

    expect(settings).toBeDefined();
  });
});

describe("user management", () => {
  it("should allow admin to update seller code", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.users.updateSellerCode({
      userId: 2,
      sellerCode: "V002",
    });

    expect(result).toEqual({ success: true });
  });

  it("should allow admin to update user role", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.users.updateRole({
      userId: 2,
      role: "admin",
    });

    expect(result).toEqual({ success: true });
  });

  it("should prevent non-admin from updating user roles", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.users.updateRole({
        userId: 2,
        role: "admin",
      })
    ).rejects.toThrow("Admin access required");
  });
});
