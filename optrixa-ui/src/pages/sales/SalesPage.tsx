import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { salesApi } from '../../api/salesApi';
import { formatCurrency, formatDate, getPaymentStatusColor } from '../../utils/formatters';
import type { Sale } from '../../types/sale.types';
import CreateSaleModal from './CreateSaleModal';
import PageHeader from '../../components/ui/PageHeader';
import { ShoppingCart } from 'lucide-react';

const SalesPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sales', page],
    queryFn: () => salesApi.getAll({ page, pageSize: 10 }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      salesApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Payment status updated!');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => toast.error('Failed to update status.'),
  });

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const sales = data?.data?.items ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const totalCount = data?.data?.totalCount ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        description="Manage invoices and track revenue"
        icon={ShoppingCart}
        action={
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            New Sale
          </button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500">Total Sales</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">
            {totalCount}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Page Revenue</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(
              sales.reduce((sum, s) => sum + s.totalAmount, 0)
            )}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Pending Payments</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {sales.filter((s) => s.paymentStatus === 'Pending').length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-10 px-4 py-3" />
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Invoice
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Items
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Total
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Date
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
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No sales yet. Create your first invoice!
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <>
                    {/* Main Row */}
                    <tr
                      key={sale.id}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                        expandedRow === sale.id ? 'bg-indigo-50/30' : ''
                      }`}
                      onClick={() => toggleRow(sale.id)}
                    >
                      {/* Expand toggle */}
                      <td className="px-4 py-4">
                        <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                          {expandedRow === sale.id ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                      </td>

                      {/* Invoice Number */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          {sale.invoiceNumber}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 text-gray-700">
                        {sale.customerName ?? (
                          <span className="text-gray-400 italic">
                            Walk-in
                          </span>
                        )}
                      </td>

                      {/* Items count */}
                      <td className="px-6 py-4 text-gray-500">
                        <span className="badge-info">
                          {sale.items?.length ?? 0}{' '}
                          {sale.items?.length === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {formatCurrency(sale.totalAmount)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={getPaymentStatusColor(sale.paymentStatus)}>
                          {sale.paymentStatus}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(sale.saleDate)}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          {sale.paymentStatus === 'Pending' && (
                            <>
                              <button
                                onClick={() =>
                                  statusMutation.mutate({
                                    id: sale.id,
                                    status: 'Paid',
                                  })
                                }
                                disabled={statusMutation.isPending}
                                className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                              >
                                Mark Paid
                              </button>
                              <button
                                onClick={() =>
                                  statusMutation.mutate({
                                    id: sale.id,
                                    status: 'Overdue',
                                  })
                                }
                                disabled={statusMutation.isPending}
                                className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                              >
                                Overdue
                              </button>
                            </>
                          )}
                          {sale.paymentStatus === 'Overdue' && (
                            <button
                              onClick={() =>
                                statusMutation.mutate({
                                  id: sale.id,
                                  status: 'Paid',
                                })
                              }
                              disabled={statusMutation.isPending}
                              className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              Mark Paid
                            </button>
                          )}
                          {sale.paymentStatus === 'Paid' && (
                            <span className="text-xs text-gray-400 italic">
                              Completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row — Line Items */}
                    {expandedRow === sale.id && (
                      <tr key={`${sale.id}-expanded`}>
                        <td colSpan={8} className="px-0 py-0">
                          <div className="bg-indigo-50/40 border-t border-b border-indigo-100 px-16 py-4">

                            {/* Invoice Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                                Invoice {sale.invoiceNumber} — Line Items
                              </div>
                              <div className="text-xs text-gray-500">
                                {sale.paymentMethod && (
                                  <span className="bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                    💳 {sale.paymentMethod}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Line Items Table */}
                            {sale.items && sale.items.length > 0 ? (
                              <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                      <th className="text-left px-4 py-2.5 text-gray-500 font-medium text-xs">
                                        Product
                                      </th>
                                      <th className="text-right px-4 py-2.5 text-gray-500 font-medium text-xs">
                                        Qty
                                      </th>
                                      <th className="text-right px-4 py-2.5 text-gray-500 font-medium text-xs">
                                        Unit Price
                                      </th>
                                      <th className="text-right px-4 py-2.5 text-gray-500 font-medium text-xs">
                                        Cost Price
                                      </th>
                                      <th className="text-right px-4 py-2.5 text-gray-500 font-medium text-xs">
                                        Profit
                                      </th>
                                      <th className="text-right px-4 py-2.5 text-gray-500 font-medium text-xs">
                                        Line Total
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {sale.items.map((item, index) => {
                                      const profit =
                                        (item.unitPrice - item.costPrice) *
                                        item.quantity;
                                      const margin =
                                        item.unitPrice > 0
                                          ? (
                                              ((item.unitPrice - item.costPrice) /
                                                item.unitPrice) *
                                              100
                                            ).toFixed(1)
                                          : '0';

                                      return (
                                        <tr
                                          key={index}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="px-4 py-3 font-medium text-gray-800">
                                            {item.productName || (
                                              <span className="text-gray-400 italic">
                                                Product #{item.productId}
                                              </span>
                                            )}
                                          </td>
                                          <td className="px-4 py-3 text-right text-gray-600">
                                            {item.quantity}
                                          </td>
                                          <td className="px-4 py-3 text-right text-gray-600">
                                            {formatCurrency(item.unitPrice)}
                                          </td>
                                          <td className="px-4 py-3 text-right text-gray-500">
                                            {formatCurrency(item.costPrice)}
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                            <span
                                              className={
                                                profit >= 0
                                                  ? 'text-green-600 font-medium'
                                                  : 'text-red-600 font-medium'
                                              }
                                            >
                                              {formatCurrency(profit)}
                                              <span className="text-xs text-gray-400 ml-1">
                                                ({margin}%)
                                              </span>
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                            {formatCurrency(item.lineTotal)}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>

                                  {/* Totals Footer */}
                                  <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                    <tr>
                                      <td
                                        colSpan={5}
                                        className="px-4 py-2 text-right text-xs text-gray-500"
                                      >
                                        Subtotal
                                      </td>
                                      <td className="px-4 py-2 text-right font-medium text-gray-700">
                                        {formatCurrency(sale.subTotal)}
                                      </td>
                                    </tr>
                                    {sale.taxAmount > 0 && (
                                      <tr>
                                        <td
                                          colSpan={5}
                                          className="px-4 py-2 text-right text-xs text-gray-500"
                                        >
                                          Tax
                                        </td>
                                        <td className="px-4 py-2 text-right text-gray-700">
                                          {formatCurrency(sale.taxAmount)}
                                        </td>
                                      </tr>
                                    )}
                                    {sale.discount > 0 && (
                                      <tr>
                                        <td
                                          colSpan={5}
                                          className="px-4 py-2 text-right text-xs text-gray-500"
                                        >
                                          Discount
                                        </td>
                                        <td className="px-4 py-2 text-right text-red-600">
                                          -{formatCurrency(sale.discount)}
                                        </td>
                                      </tr>
                                    )}
                                    <tr>
                                      <td
                                        colSpan={5}
                                        className="px-4 py-3 text-right text-sm font-bold text-gray-800"
                                      >
                                        Total
                                      </td>
                                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">
                                        {formatCurrency(sale.totalAmount)}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-400 text-sm">
                                No item details available.
                              </div>
                            )}

                            {/* Notes */}
                            {sale.notes && (
                              <div className="mt-3 text-xs text-gray-500 italic">
                                📝 Note: {sale.notes}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <CreateSaleModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default SalesPage;