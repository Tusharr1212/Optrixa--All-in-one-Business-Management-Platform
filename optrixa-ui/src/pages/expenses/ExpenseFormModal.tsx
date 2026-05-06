import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { expensesApi } from '../../api/expensesApi';
import { categoriesApi } from '../../api/categoriesApi';
import type { Expense } from '../../types/expense.types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  categoryId: z.number().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  expenseDate: z.string().min(1, 'Date is required'),
  receiptUrl: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  expense: Expense | null;
  onClose: () => void;
}

const ExpenseFormModal = ({ expense, onClose }: Props) => {
  const queryClient = useQueryClient();
  const isEditing = !!expense;

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'Expense'],
    queryFn: () => categoriesApi.getAll('Expense'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      expenseDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (expense) {
      reset({
        title: expense.title,
        description: expense.description,
        categoryId: expense.categoryId,
        amount: expense.amount,
        expenseDate: expense.expenseDate.split('T')[0],
        receiptUrl: expense.receiptUrl,
      });
    }
  }, [expense, reset]);

  const createMutation = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      toast.success('Expense created!');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      onClose();
    },
    onError: () => toast.error('Failed to create expense.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      expensesApi.update(id, { ...data, id }),
    onSuccess: () => {
      toast.success('Expense updated!');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      onClose();
    },
    onError: () => toast.error('Failed to update expense.'),
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate({ id: expense.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const categories = categoriesData?.data ?? [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Title</label>
            <input {...register('title')} className="input" placeholder="Office Rent - May" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="label">Amount ($)</label>
              <input {...register('amount', { valueAsNumber: true })} type="number" step="0.01" className="input" placeholder="0.00" />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Date</label>
            <input {...register('expenseDate')} type="date" className="input" />
            {errors.expenseDate && <p className="text-red-500 text-xs mt-1">{errors.expenseDate.message}</p>}
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <textarea {...register('description')} className="input" rows={2} placeholder="Additional notes..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
              {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;