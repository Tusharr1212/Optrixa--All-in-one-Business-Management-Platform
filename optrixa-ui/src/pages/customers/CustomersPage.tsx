import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Users, Mail, Phone, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { customersApi} from '../../api/customersApi';
import type {Customer, CreateCustomerDto } from '../../api/customersApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import SearchBar from '../../components/ui/SearchBar';
import ConfirmModal from '../../components/ui/ConfirmModal';

const defaultForm: CreateCustomerDto = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
};

const CustomersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateCustomerDto>(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => customersApi.getAll(search || undefined),
  });

  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      toast.success('Customer created!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: () => toast.error('Failed to create customer.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateCustomerDto }) =>
      customersApi.update(id, data),
    onSuccess: () => {
      toast.success('Customer updated!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditCustomer(null);
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: () => toast.error('Failed to update customer.'),
  });

  const deleteMutation = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      toast.success('Customer deleted.');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete customer.'),
  });

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setForm({
      fullName: customer.fullName,
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error('Customer name is required.');
      return;
    }
    if (editCustomer) {
      updateMutation.mutate({ id: editCustomer.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditCustomer(null);
    setForm(defaultForm);
  };

  const customers = data?.data ?? [];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const totalRevenue = customers.reduce((s, c) => s + c.totalPurchases, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your customer records and purchase history"
        icon={Users}
        action={
          <button
            onClick={() => {
              setEditCustomer(null);
              setForm(defaultForm);
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Customer
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500 mb-1">Total Customers</div>
          <div className="text-2xl font-bold text-gray-800">
            {customers.length}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalRevenue)}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500 mb-1">Avg. per Customer</div>
          <div className="text-2xl font-bold text-indigo-600">
            {formatCurrency(
              customers.length > 0 ? totalRevenue / customers.length : 0
            )}
          </div>
        </div>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            {editCustomer ? 'Edit Customer' : 'New Customer'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  className="input"
                  placeholder="John Smith"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="john@email.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className="input"
                  placeholder="+1 234 567 8900"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Address</label>
                <input
                  className="input"
                  placeholder="123 Main St, City"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
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
                {editCustomer ? 'Update Customer' : 'Create Customer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name, email or phone..."
      />

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Phone
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Total Purchases
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Member Since
                </th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Users}
                      title="No customers found"
                      description={
                        search
                          ? `No customers match "${search}".`
                          : 'Add your first customer to start tracking purchases.'
                      }
                      action={
                        !search
                          ? {
                              label: 'Add Customer',
                              onClick: () => setShowForm(true),
                            }
                          : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-600 text-xs font-bold">
                            {customer.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="font-medium text-gray-800">
                          {customer.fullName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {customer.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail size={13} className="text-gray-400" />
                          {customer.email}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {customer.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} className="text-gray-400" />
                          {customer.phone}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={13} className="text-green-500" />
                        <span className="font-semibold text-gray-800">
                          {formatCurrency(customer.totalPurchases)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(customer.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>

      {deleteId !== null && (
        <ConfirmModal
          title="Delete Customer"
          message="Are you sure? This customer's sales history will be preserved."
          confirmLabel="Delete Customer"
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default CustomersPage;