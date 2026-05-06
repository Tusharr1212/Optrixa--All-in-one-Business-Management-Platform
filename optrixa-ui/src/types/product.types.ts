export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  imageUrl?: string;
  costPrice: number;
  sellingPrice: number;
  margin: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isActive: boolean;
  categoryName: string;
  supplierName?: string;
  createdAt: string;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  description?: string;
  categoryId: number;
  supplierId?: number;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
}

export interface UpdateProductDto extends CreateProductDto {
  id: number;
  isActive: boolean;
}