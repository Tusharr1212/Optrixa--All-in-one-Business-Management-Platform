import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi } from '../../api/productsApi';
import { formatCurrency } from '../../utils/formatters';
import type { Product } from '../../types/product.types';
import ProductFormModal from './ProductFormModal.tsx';

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search],
    queryFn: () => productsApi.getAll({ page, pageSize: 10, searchTerm: search }),
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      toast.success('Product deleted.');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => toast.error('Failed to delete product.'),
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditProduct(null);
  };

  const products = data?.data?.items ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your products and stock levels</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Product</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">SKU</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Category</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Cost</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Price</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Margin</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Stock</th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No products found. Add your first product!
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{product.sku}</td>
                    <td className="px-6 py-4 text-gray-500">{product.categoryName}</td>
                    <td className="px-6 py-4 text-gray-600">{formatCurrency(product.costPrice)}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{formatCurrency(product.sellingPrice)}</td>
                    <td className="px-6 py-4">
                      <span className="badge-success">{product.margin}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {product.isLowStock && (
                          <AlertTriangle size={14} className="text-yellow-500" />
                        )}
                        <span className={product.isLowStock ? 'text-yellow-600 font-medium' : 'text-gray-700'}>
                          {product.stockQuantity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
                className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ProductFormModal
          product={editProduct}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ProductsPage;