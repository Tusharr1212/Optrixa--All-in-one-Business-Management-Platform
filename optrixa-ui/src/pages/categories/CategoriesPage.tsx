import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../api/categoriesApi';
import type { Category } from '../../types/common.types';

interface CategoryFormData {
  name: string;
  description: string;
  type: 'Product' | 'Expense';
}

const defaultForm: CategoryFormData = {
  name: '',
  description: '',
  type: 'Product',
};

const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'Product' | 'Expense'>('Product');
  const [form, setForm] = useState<CategoryFormData>(defaultForm);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['categories', activeTab],
    queryFn: () => categoriesApi.getAll(activeTab),
  });

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      toast.success('Category created!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setForm(defaultForm);
      setShowForm(false);
    },
    onError: () => toast.error('Failed to create category.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`http://localhost:5019/api/Categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('optrixa-auth')
            ? JSON.parse(localStorage.getItem('optrixa-auth')!).state.token
            : ''}`,
        },
      }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Category deleted.');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: () => toast.error('Failed to delete category.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required.');
      return;
    }
    createMutation.mutate({
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this category? Products using it will be unaffected.')) {
      deleteMutation.mutate(id);
    }
  };

  const categories = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage product and expense categories
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm({ ...defaultForm, type: activeTab }); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {showForm && (
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">New Category</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  placeholder="e.g. Electronics"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Type</label>
                <select
                  className="input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as 'Product' | 'Expense' })}
                >
                  <option value="Product">Product</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <input
                  className="input"
                  placeholder="Brief description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {createMutation.isPending && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Create Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['Product', 'Expense'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab} Categories
          </button>
        ))}
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 h-20 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Tag size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">
            No {activeTab.toLowerCase()} categories yet.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-indigo-600 text-sm font-medium mt-2 hover:underline"
          >
            Add your first category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category: Category) => (
            <div
              key={category.id}
              className="card p-4 flex items-start justify-between group"
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activeTab === 'Product'
                    ? 'bg-indigo-100'
                    : 'bg-orange-100'
                }`}>
                  <Tag size={16} className={
                    activeTab === 'Product'
                      ? 'text-indigo-600'
                      : 'text-orange-600'
                  } />
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm">
                    {category.name}
                  </div>
                  {category.description && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {category.description}
                    </div>
                  )}
                  <div className="mt-1">
                    <span className={activeTab === 'Product' ? 'badge-info' : 'badge-warning'}>
                      {category.type}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(category.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;