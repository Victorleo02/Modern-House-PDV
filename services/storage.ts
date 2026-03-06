
import { Database, Product, Sale, Vendor, User, UserRole, StoreInfo, ProductStatus } from '../types';

// ========================================================
// CONFIGURAÇÕES DA FONTE (MODIFIQUE AQUI)
// ========================================================

// Aumente a versão (ex: 'v1' para 'v2') para forçar todos os usuários 
// a receberem os novos dados da fonte após o deploy.
const DB_VERSION = 'modern_house_v2_db'; 

const INITIAL_STORE_INFO: StoreInfo = {
  name: 'Modern House',
  razonSocial: 'Modern House Decorações LTDA',
  cnpj: '12.345.678/0001-90',
  address: 'Rua Nunes Freire, S/N, Tabatinga - Apicum-Açu/MA',
  phone: '(98) 97021-2309'
};

// LISTA DE PRODUTOS INICIAIS (FONTE)
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    barcode: 'MH001',
    name: 'Sofá Retrátil Velvet',
    description: 'Sofá 3 lugares tecido velvet cinza',
    brand: 'Modern Comfort',
    purchasePrice: 1200,
    salePrice: 2490.90,
    quantity: 10,
    supplier: 'Comfort S.A',
    lastEntryDate: new Date().toISOString(),
    status: 'ATIVO' as ProductStatus
  },
  {
    id: '2',
    barcode: 'MH002',
    name: 'Mesa de Jantar Escandinava',
    description: 'Mesa de madeira maciça 6 lugares',
    brand: 'Design Wood',
    purchasePrice: 800,
    salePrice: 1850.00,
    quantity: 5,
    supplier: 'Madeiras do Sul',
    lastEntryDate: new Date().toISOString(),
    status: 'ATIVO' as ProductStatus
  },
  {
    id: '3',
    barcode: 'MH002',
    name: 'Mesa de Jantar Escandinava',
    description: 'Mesa de madeira maciça 4 lugares',
    brand: 'Design Wood',
    purchasePrice: 800,
    salePrice: 1550.00,
    quantity: 5,
    supplier: 'Madeiras do Sul',
    lastEntryDate: new Date().toISOString(),
    status: 'ATIVO' as ProductStatus
  }
];

// LISTA DE USUÁRIOS INICIAIS (FONTE)
const INITIAL_USERS: User[] = [
  { 
    id: '1', 
    username: 'rose.ramos', 
    password: 'rose123', 
    name: 'Rosilene Ramos', 
    role: UserRole.ADMIN 
  },
  {
    id: '2',
    username: 'clicia.tavares',
    password: 'clicia123',
    name: 'Clicia Tavares',
    role: UserRole.VENDEDOR
  },
  {
    id: '3',
    username: 'victor.leonardo',
    password: 'Sempre02',
    name: 'Victor Leonardo',
    role: UserRole.ADMIN
  },
  {
    id: '4',
    username: 'camila.gaspar',
    password: 'camila123',
    name: 'Camila Gaspar',
    role: UserRole.VENDEDOR
  },
  {
    id: '5',
    username: 'railene.pinheiro',
    password: 'railene123',
    name: 'Railene Pinheiro',
    role: UserRole.VENDEDOR
  }
];

const INITIAL_VENDORS: Vendor[] = [
  { code: 'Railene Pinheiro', name: 'Railene Pinheiro' },
  { code: 'Camila Gaspar', name: 'Camila Gaspar' },
  { code: 'Clicia Tavares', name: 'Clicia Tavares' },
  { code: 'Rosilene Ramos', name: 'Rosilene Ramos' }
];

const INITIAL_DB: Database = {
  products: INITIAL_PRODUCTS,
  sales: [],
  vendors: INITIAL_VENDORS,
  users: INITIAL_USERS,
  storeInfo: INITIAL_STORE_INFO
};

// ========================================================
// LÓGICA DO SISTEMA
// ========================================================

const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

export const storage = {
  getDb: async (): Promise<Database> => {
    await delay();
    const data = localStorage.getItem(DB_VERSION);
    if (!data) {
      // Se não existe a versão atual no navegador, salva a inicial da fonte
      localStorage.setItem(DB_VERSION, JSON.stringify(INITIAL_DB));
      return INITIAL_DB;
    }
    
    const parsed = JSON.parse(data);
    return {
      ...INITIAL_DB,
      ...parsed,
      storeInfo: parsed.storeInfo || INITIAL_STORE_INFO
    };
  },
  
  saveDb: async (db: Database) => {
    await delay();
    localStorage.setItem(DB_VERSION, JSON.stringify(db));
  },
  
  importDb: async (newDb: Database) => {
    if (newDb && Array.isArray(newDb.products) && Array.isArray(newDb.sales)) {
      localStorage.setItem(DB_VERSION, JSON.stringify(newDb));
      return true;
    }
    return false;
  },
  
  getProducts: async () => (await storage.getDb()).products,
  getSales: async () => (await storage.getDb()).sales,
  getVendors: async () => (await storage.getDb()).vendors,
  getUsers: async () => (await storage.getDb()).users,
  getStoreInfo: async () => (await storage.getDb()).storeInfo,
  
  updateProducts: async (products: Product[]) => {
    const db = await storage.getDb();
    db.products = products;
    await storage.saveDb(db);
  },
  
  addSale: async (sale: Sale) => {
    const db = await storage.getDb();
    db.sales.push(sale);
    await storage.saveDb(db);
  },

  cancelSale: async (saleId: string) => {
    const db = await storage.getDb();
    const saleIndex = db.sales.findIndex(s => s.id === saleId);
    
    if (saleIndex !== -1 && db.sales[saleIndex].status !== 'CANCELLED') {
      const sale = db.sales[saleIndex];
      
      db.products = db.products.map(product => {
        const itemSold = sale.items.find(i => i.productId === product.id);
        if (itemSold) {
          return { ...product, quantity: product.quantity + itemSold.quantity };
        }
        return product;
      });

      db.sales[saleIndex].status = 'CANCELLED';
      await storage.saveDb(db);
      return true;
    }
    return false;
  },

  updateVendors: async (vendors: Vendor[]) => {
    const db = await storage.getDb();
    db.vendors = vendors;
    await storage.saveDb(db);
  },

  updateUsers: async (users: User[]) => {
    const db = await storage.getDb();
    db.users = users;
    await storage.saveDb(db);
  },

  updateStoreInfo: async (info: StoreInfo) => {
    const db = await storage.getDb();
    db.storeInfo = info;
    await storage.saveDb(db);
  }
};
