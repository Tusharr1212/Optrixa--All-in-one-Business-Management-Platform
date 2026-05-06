export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: number;
  invoiceNumber: string;
  customerName?: string;
  customerId?: number;
  subTotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  notes?: string;
  saleDate: string;
  dueDate?: string;
  items: SaleItem[];
  createdAt: string;
}

export interface CreateSaleItemDto {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleDto {
  customerId?: number;
  taxRate: number;
  discount: number;
  paymentMethod?: string;
  notes?: string;
  dueDate?: string;
  items: CreateSaleItemDto[];
}