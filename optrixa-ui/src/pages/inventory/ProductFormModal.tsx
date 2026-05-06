import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi } from '../../api/productsApi';
import { categoriesApi } from '../../api/categoriesApi';
import type { Product } from '../../types/product.types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required').regex(/^[A-Z0-9\-]+$/, 'SKU must be uppercase letters, numbers, hyphens'),
  description: z.string().optional(),
  categoryId: z.number().min(1, 'Category is required'),
  supplierId: z.number().optional().nullable(),
  costPrice: z.number().min(0.01, 'Cost price must be greater than 0'),
  sellingPrice: z.number().min(0.01, 'Selling price must be greater than 0'),
  stockQuantity: z.number().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.number().min(1, 'Threshold must be at least 1'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  product: Product | null;
  onClose: () => void;
}

const ProductFormModal = ({ product, onClose }: Props) => {
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'Product'],
    queryFn: () => categoriesApi.getAll('Product'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      lowStockThreshold: 10,
      stockQuantity: 0,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description,
        categoryId: product.categoryName ? 1 : 1,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
      });
    }
  }, [product, reset]);

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      toast.success('Product created successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? 'Failed to create product.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      productsApi.update(id, { ...data, id, isActive: true }),
    onSuccess: () => {
      toast.success('Product updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? 'Failed to update product.');
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate({ id: product.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const categories = categoriesData?.data ?? [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Product Name</label>
              <input {...register('name')} className="input" placeholder="Samsung TV 55" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">SKU</label>
              <input {...register('sku')} className="input" placeholder="ELEC-TV-001"
                onChange={(e) => e.target.value = e.target.value.toUpperCase()} />
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
            </div>

            <div>
              <label className="label">Category</label>
              <select {...register('categoryId', { valueAsNumber: true })} className="input">
                <option value={0}>Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label className="label">Cost Price ($)</label>
              <input {...register('costPrice', { valueAsNumber: true })} type="number" step="0.01" className="input" placeholder="0.00" />
              {errors.costPrice && <p className="text-red-500 text-xs mt-1">{errors.costPrice.message}</p>}
            </div>

            <div>
              <label className="label">Selling Price ($)</label>
              <input {...register('sellingPrice', { valueAsNumber: true })} type="number" step="0.01" className="input" placeholder="0.00" />
              {errors.sellingPrice && <p className="text-red-500 text-xs mt-1">{errors.sellingPrice.message}</p>}
            </div>

            <div>
              <label className="label">Stock Quantity</label>
              <input {...register('stockQuantity', { valueAsNumber: true })} type="number" className="input" placeholder="0" />
              {errors.stockQuantity && <p className="text-red-500 text-xs mt-1">{errors.stockQuantity.message}</p>}
            </div>

            <div>
              <label className="label">Low Stock Threshold</label>
              <input {...register('lowStockThreshold', { valueAsNumber: true })} type="number" className="input" placeholder="10" />
              {errors.lowStockThreshold && <p className="text-red-500 text-xs mt-1">{errors.lowStockThreshold.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="label">Description (optional)</label>
              <textarea {...register('description')} className="input" rows={3} placeholder="Product description..." />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;