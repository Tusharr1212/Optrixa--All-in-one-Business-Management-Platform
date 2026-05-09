import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Truck, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { suppliersApi} from '../../api/suppliersApi';
import type {Supplier, CreateSupplierDto } from '../../api/suppliersApi';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/ui/ConfirmModal';

const defaultForm: CreateSupplierDto = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
};

const SuppliersPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateSupplierDto>(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: suppliersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: suppliersApi.create,
    onSuccess: () => {
      toast.success('Supplier created!');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: () => toast.error('Failed to create supplier.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateSupplierDto }) =>
      suppliersApi.update(id, data),
    onSuccess: () => {
      toast.success('Supplier updated!');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setEditSupplier(null);
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: () => toast.error('Failed to update supplier.'),
  });

  const deleteMutation = useMutation({
    mutationFn: suppliersApi.delete,
    onSuccess: () => {
      toast.success('Supplier deleted.');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete supplier.'),
  });

  const handleEdit = (supplier: Supplier) => {
    setEditSupplier(supplier);
    setForm({
      name: supplier.name,
      contactName: supplier.contactName ?? '',
      email: supplier.email ?? '',
      phone: supplier.phone ?? '',
      address: supplier.address ?? '',
      notes: supplier.notes ?? '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Supplier name is required.');
      return;
    }
    if (editSupplier) {
      updateMutation.mutate({ id: editSupplier.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditSupplier(null);
    setForm(defaultForm);
  };

  const suppliers = data?.data ?? [];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage your product suppliers and vendors"
        icon={Truck}
        action={
          <button
            onClick={() => { setEditSupplier(null); setForm(defaultForm); setShowForm(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Supplier
          </button>
        }
      />

      {/* Inline Form */}
      {showForm && (
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            {editSupplier ? 'Edit Supplier' : 'New Supplier'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Supplier Name *</label>
                <input
                  className="input"
                  placeholder="Acme Corp"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Contact Person</label>
                <input
                  className="input"
                  placeholder="John Smith"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="contact@supplier.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className="input"
                  placeholder="+1 234 567 8900"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Address</label>
                <input
                  className="input"
                  placeholder="123 Business St, City, Country"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Notes</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Additional notes about this supplier..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {editSupplier ? 'Update Supplier' : 'Create Supplier'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Suppliers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 h-36 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Truck}
            title="No suppliers yet"
            description="Add your first supplier to start linking products to vendors."
            action={{ label: 'Add Supplier', onClick: () => setShowForm(true) }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="card p-5 hover:shadow-md transition-shadow group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Truck size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {supplier.name}
                    </div>
                    {supplier.contactName && (
                      <div className="text-xs text-gray-500">
                        {supplier.contactName}
                      </div>
                    )}
                  </div>
                </div>
                {/* Actions — visible on hover */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(supplier)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(supplier.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5">
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={13} className="text-gray-400 flex-shrink-0" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="text-xs text-gray-400 mt-2 truncate">
                    📍 {supplier.address}
                  </div>
                )}
              </div>

              {supplier.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {supplier.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete */}
      {deleteId !== null && (
        <ConfirmModal
          title="Delete Supplier"
          message="Are you sure you want to delete this supplier? Products linked to this supplier will be unaffected."
          confirmLabel="Delete Supplier"
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default SuppliersPage;