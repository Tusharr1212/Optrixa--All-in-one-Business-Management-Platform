import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, AlertTriangle, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi } from '../../api/productsApi';
import { formatCurrency } from '../../utils/formatters';
import type { Product } from '../../types/product.types';
import ProductFormModal from './ProductFormModal';
import EmptyState from '../../components/ui/EmptyState';
import TableSkeleton from '../../components/ui/TableSkeleton';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmModal from '../../components/ui/ConfirmModal';

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search],
    queryFn: () => productsApi.getAll({ page, pageSize: 10, searchTerm: search }),
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      toast.success('Product deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete product.'),
  });

  const products = data?.data?.items ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const totalCount = data?.data?.totalCount ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Manage your products and stock levels"
        icon={Package}
        action={
          <button
            onClick={() => { setEditProduct(null); setShowModal(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Product
          </button>
        }
      />

      {/* Search + Stats */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SearchBar
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Search by name or SKU..."
        />
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>
            <span className="font-semibold text-gray-700">{totalCount}</span> products
          </span>
          {products.filter(p => p.isLowStock).length > 0 && (
            <span className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle size={14} />
              <span className="font-semibold">
                {products.filter(p => p.isLowStock).length}
              </span> low stock
            </span>
          )}
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
                <TableSkeleton rows={5} cols={8} />
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={Package}
                      title="No products found"
                      description={
                        search
                          ? `No products match "${search}". Try a different search.`
                          : 'Get started by adding your first product to inventory.'
                      }
                      action={
                        !search
                          ? { label: 'Add Product', onClick: () => setShowModal(true) }
                          : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {product.name}
                      </div>
                      {!product.isActive && (
                        <span className="text-xs text-gray-400">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 bg-gray-50">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge-info">{product.categoryName}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatCurrency(product.costPrice)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {formatCurrency(product.sellingPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={
                        product.margin > 30
                          ? 'badge-success'
                          : product.margin > 10
                          ? 'badge-warning'
                          : 'badge-danger'
                      }>
                        {product.margin}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {product.isLowStock && (
                          <AlertTriangle
                            size={14}
                            className="text-yellow-500 flex-shrink-0"
                          />
                        )}
                        <span className={`font-medium ${
                          product.isLowStock
                            ? 'text-yellow-600'
                            : 'text-gray-700'
                        }`}>
                          {product.stockQuantity}
                        </span>
                        <span className="text-gray-400 text-xs">
                          / {product.lowStockThreshold} min
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditProduct(product);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete product"
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

        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={10}
          onPageChange={setPage}
        />
      </div>

      {/* Modals */}
      {showModal && (
        <ProductFormModal
          product={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
        />
      )}

      {deleteId !== null && (
        <ConfirmModal
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          confirmLabel="Delete Product"
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default ProductsPage;