
export enum PaymentMethod {
  CASH = 'Espécie',
  DEBIT = 'Débito',
  CREDIT = 'Crédito',
  PIX = 'PIX'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  VENDEDOR = 'VENDEDOR'
}

export type SaleStatus = 'COMPLETED' | 'CANCELLED';
export type ProductStatus = 'ATIVO' | 'INATIVO' | 'ESGOTADO';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface StoreInfo {
  name: string;
  razonSocial: string;
  cnpj: string;
  address: string;
  phone: string;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  description: string;
  brand: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  supplier: string;
  lastEntryDate: string;
  status: ProductStatus;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  totalValue: number;
  amountReceived: number;
  change: number;
  paymentMethod: PaymentMethod;
  vendorCode: string;
  status: SaleStatus;
}

export interface Vendor {
  code: string;
  name: string;
}

export interface Database {
  products: Product[];
  sales: Sale[];
  vendors: Vendor[];
  users: User[];
  storeInfo: StoreInfo;
}
