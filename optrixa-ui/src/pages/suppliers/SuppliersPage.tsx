import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Edit, Trash2, Truck, Mail,
  Phone, ChevronDown, ChevronRight,
  CreditCard, AlertCircle, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import {suppliersApi} from '../../api/suppliersApi';
import type {Supplier,CreateSupplierDto} from '../../api/suppliersApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
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

// Payment Modal
const PaymentModal = ({
  supplier,
  onClose,
}: {
  supplier: Supplier;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const payMutation = useMutation({
    mutationFn: () =>
      suppliersApi.recordPayment(
        supplier.id,
        parseFloat(amount),
        notes
      ),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        onClose();
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to record payment.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }
    if (amt > supplier.outstandingBalance) {
      toast.error(
        `Amount exceeds outstanding balance of ${formatCurrency(supplier.outstandingBalance)}`
      );
      return;
    }
    payMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            Record Payment
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Paying:{' '}
            <span className="font-medium text-gray-700">
              {supplier.name}
            </span>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Balance Info */}
          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Total Purchased</span>
              <span className="font-medium text-gray-700">
                {formatCurrency(supplier.totalPurchased)}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Total Paid</span>
              <span className="font-medium text-green-600">
                {formatCurrency(supplier.totalPaid)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-red-100">
              <span className="font-semibold text-red-700">
                Outstanding Balance
              </span>
              <span className="font-bold text-red-700">
                {formatCurrency(supplier.outstandingBalance)}
              </span>
            </div>
          </div>

          <div>
            <label className="label">Payment Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={supplier.outstandingBalance}
              className="input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() =>
                  setAmount(supplier.outstandingBalance.toFixed(2))
                }
                className="text-xs text-indigo-600 hover:underline"
              >
                Pay full balance
              </button>
            </div>
          </div>

          <div>
            <label className="label">
              Notes{' '}
              <span className="text-gray-400 font-normal">
                (optional)
              </span>
            </label>
            <input
              className="input"
              placeholder="Bank transfer ref #123..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={payMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              {payMutation.isPending && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Suppliers Page ────────────────────────────────────────
const SuppliersPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [payingSupplier, setPayingSupplier] =
    useState<Supplier | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
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
  const isSubmitting =
    createMutation.isPending || updateMutation.isPending;

  // Summary stats
  const totalOwed = suppliers.reduce(
    (s, sup) => s + (sup.outstandingBalance ?? 0),
    0
  );
  const totalPurchased = suppliers.reduce(
    (s, sup) => s + (sup.totalPurchased ?? 0),
    0
  );
  const suppliersWithBalance = suppliers.filter(
    (s) => (s.outstandingBalance ?? 0) > 0
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage vendors and track outstanding balances"
        icon={Truck}
        action={
          <button
            onClick={() => {
              setEditSupplier(null);
              setForm(defaultForm);
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Supplier
          </button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500 mb-1">
            Total Suppliers
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {suppliers.length}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500 mb-1">
            Total Purchased
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {formatCurrency(totalPurchased)}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
            <AlertCircle size={13} className="text-red-500" />
            Outstanding Balance
          </div>
          <div
            className={`text-2xl font-bold ${
              totalOwed > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {formatCurrency(totalOwed)}
          </div>
          {suppliersWithBalance > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              {suppliersWithBalance} supplier
              {suppliersWithBalance > 1 ? 's' : ''} owed
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
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
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Contact Person</label>
                <input
                  className="input"
                  placeholder="John Smith"
                  value={form.contactName}
                  onChange={(e) =>
                    setForm({ ...form, contactName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="contact@supplier.com"
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
              <div className="md:col-span-2">
                <label className="label">Address</label>
                <input
                  className="input"
                  placeholder="123 Business St, City"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Notes</label>
                <textarea
                  className="input"
                  rows={2}
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
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
                {editSupplier ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Suppliers List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="card p-6 h-24 animate-pulse bg-gray-50"
            />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Truck}
            title="No suppliers yet"
            description="Add your first supplier to start tracking purchases and balances."
            action={{
              label: 'Add Supplier',
              onClick: () => setShowForm(true),
            }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {suppliers.map((supplier) => {
            const isExpanded = expandedId === supplier.id;
            const hasBalance =
              (supplier.outstandingBalance ?? 0) > 0;
            const unpaidExpenses =
              supplier.expenses?.filter((e) => !e.isPaid) ?? [];
            const paidExpenses =
              supplier.expenses?.filter((e) => e.isPaid) ?? [];

            return (
              <div
                key={supplier.id}
                className="card overflow-hidden"
              >
                {/* Supplier Header Row */}
                <div
                  className={`p-5 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isExpanded ? 'bg-gray-50' : ''
                  }`}
                  onClick={() =>
                    setExpandedId(isExpanded ? null : supplier.id)
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Expand Arrow */}
                      <span className="text-gray-400 mt-1 flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </span>

                      {/* Icon */}
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Truck
                          size={18}
                          className="text-indigo-600"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-800">
                            {supplier.name}
                          </span>
                          {hasBalance && (
                            <span className="badge-danger text-xs">
                              Owes {formatCurrency(supplier.outstandingBalance)}
                            </span>
                          )}
                          {!hasBalance &&
                            supplier.totalPurchased > 0 && (
                              <span className="badge-success text-xs">
                                Fully Paid
                              </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 flex-wrap">
                          {supplier.contactName && (
                            <span>{supplier.contactName}</span>
                          )}
                          {supplier.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={11} />
                              {supplier.email}
                            </span>
                          )}
                          {supplier.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={11} />
                              {supplier.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Balance Summary + Actions */}
                    <div
                      className="flex items-center gap-6 flex-shrink-0 ml-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-right hidden md:block">
                        <div className="text-xs text-gray-400">
                          Purchased
                        </div>
                        <div className="text-sm font-semibold text-gray-700">
                          {formatCurrency(
                            supplier.totalPurchased ?? 0
                          )}
                        </div>
                      </div>
                      <div className="text-right hidden md:block">
                        <div className="text-xs text-gray-400">
                          Paid
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(supplier.totalPaid ?? 0)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">
                          Balance
                        </div>
                        <div
                          className={`text-sm font-bold ${
                            hasBalance
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {formatCurrency(
                            supplier.outstandingBalance ?? 0
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {hasBalance && (
                          <button
                            onClick={() =>
                              setPayingSupplier(supplier)
                            }
                            className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            <CreditCard size={13} />
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(supplier.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded — Transaction History */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      Transaction History
                    </h4>

                    {(!supplier.expenses ||
                      supplier.expenses.length === 0) ? (
                      <p className="text-sm text-gray-400 text-center py-4">
                        No expenses recorded for this supplier yet.
                        <br />
                        <span className="text-xs">
                          Add an expense and select this supplier to
                          start tracking.
                        </span>
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {/* Unpaid */}
                        {unpaidExpenses.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle
                                size={13}
                                className="text-red-500"
                              />
                              <span className="text-xs font-medium text-red-600">
                                Unpaid ({unpaidExpenses.length})
                              </span>
                            </div>
                            <div className="bg-white rounded-xl border border-red-100 overflow-hidden">
                              <table className="w-full text-xs">
                                <thead className="bg-red-50 border-b border-red-100">
                                  <tr>
                                    <th className="text-left px-4 py-2 text-gray-500 font-medium">
                                      Expense
                                    </th>
                                    <th className="text-left px-4 py-2 text-gray-500 font-medium">
                                      Category
                                    </th>
                                    <th className="text-left px-4 py-2 text-gray-500 font-medium">
                                      Date
                                    </th>
                                    <th className="text-right px-4 py-2 text-gray-500 font-medium">
                                      Amount
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {unpaidExpenses.map((exp) => (
                                    <tr
                                      key={exp.id}
                                      className="hover:bg-red-50/30"
                                    >
                                      <td className="px-4 py-2.5 font-medium text-gray-700">
                                        {exp.title}
                                      </td>
                                      <td className="px-4 py-2.5 text-gray-500">
                                        {exp.categoryName}
                                      </td>
                                      <td className="px-4 py-2.5 text-gray-500">
                                        {formatDate(exp.expenseDate)}
                                      </td>
                                      <td className="px-4 py-2.5 text-right font-semibold text-red-600">
                                        {formatCurrency(exp.amount)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-red-50 border-t border-red-100">
                                  <tr>
                                    <td
                                      colSpan={3}
                                      className="px-4 py-2 font-bold text-red-700 text-xs"
                                    >
                                      Total Unpaid
                                    </td>
                                    <td className="px-4 py-2 text-right font-bold text-red-700">
                                      {formatCurrency(
                                        unpaidExpenses.reduce(
                                          (s, e) => s + e.amount,
                                          0
                                        )
                                      )}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Paid */}
                        {paidExpenses.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle
                                size={13}
                                className="text-green-500"
                              />
                              <span className="text-xs font-medium text-green-600">
                                Paid ({paidExpenses.length})
                              </span>
                            </div>
                            <div className="bg-white rounded-xl border border-green-100 overflow-hidden">
                              <table className="w-full text-xs">
                                <thead className="bg-green-50 border-b border-green-100">
                                  <tr>
                                    <th className="text-left px-4 py-2 text-gray-500 font-medium">
                                      Expense
                                    </th>
                                    <th className="text-left px-4 py-2 text-gray-500 font-medium">
                                      Category
                                    </th>
                                    <th className="text-left px-4 py-2 text-gray-500 font-medium">
                                      Paid On
                                    </th>
                                    <th className="text-right px-4 py-2 text-gray-500 font-medium">
                                      Amount
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {paidExpenses.map((exp) => (
                                    <tr
                                      key={exp.id}
                                      className="hover:bg-green-50/30"
                                    >
                                      <td className="px-4 py-2.5 font-medium text-gray-700">
                                        {exp.title}
                                      </td>
                                      <td className="px-4 py-2.5 text-gray-500">
                                        {exp.categoryName}
                                      </td>
                                      <td className="px-4 py-2.5 text-gray-500">
                                        {exp.paidAt
                                          ? formatDate(exp.paidAt)
                                          : formatDate(
                                              exp.expenseDate
                                            )}
                                      </td>
                                      <td className="px-4 py-2.5 text-right font-medium text-green-600">
                                        {formatCurrency(exp.amount)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-green-50 border-t border-green-100">
                                  <tr>
                                    <td
                                      colSpan={3}
                                      className="px-4 py-2 font-bold text-green-700 text-xs"
                                    >
                                      Total Paid
                                    </td>
                                    <td className="px-4 py-2 text-right font-bold text-green-700">
                                      {formatCurrency(
                                        paidExpenses.reduce(
                                          (s, e) => s + e.amount,
                                          0
                                        )
                                      )}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pay button inside expanded */}
                    {hasBalance && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => setPayingSupplier(supplier)}
                          className="btn-primary flex items-center gap-2 text-sm"
                        >
                          <CreditCard size={15} />
                          Record Payment —{' '}
                          {formatCurrency(
                            supplier.outstandingBalance
                          )}{' '}
                          owed
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {deleteId !== null && (
        <ConfirmModal
          title="Delete Supplier"
          message="Are you sure? Expenses linked to this supplier will be unaffected."
          confirmLabel="Delete Supplier"
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {payingSupplier && (
        <PaymentModal
          supplier={payingSupplier}
          onClose={() => setPayingSupplier(null)}
        />
      )}
    </div>
  );
};

export default SuppliersPage;