import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { salesApi } from '../../api/salesApi';
import { formatCurrency, formatDate, getPaymentStatusColor } from '../../utils/formatters';
import CreateSaleModal from './CreateSaleModal';

const SalesPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

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

  const sales = data?.data?.items ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage invoices and track revenue
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          New Sale
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500">Total Sales</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">
            {data?.data?.totalCount ?? 0}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">This Page Revenue</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(
              sales.reduce((sum, s) => sum + s.totalAmount, 0)
            )}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Pending Payments</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {sales.filter(s => s.paymentStatus === 'Pending').length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
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
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No sales yet. Create your first invoice!
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Invoice Number */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {sale.invoiceNumber}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4 text-gray-700">
                      {sale.customerName ?? 'Walk-in Customer'}
                    </td>

                    {/* Items count */}
                    <td className="px-6 py-4 text-gray-500">
                      {sale.items?.length ?? 0}{' '}
                      {sale.items?.length === 1 ? 'item' : 'items'}
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
                    <td className="px-6 py-4">
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

      {/* Create Sale Modal */}
      {showModal && (
        <CreateSaleModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default SalesPage;