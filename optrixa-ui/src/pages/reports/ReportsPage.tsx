import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { formatCurrency } from '../../utils/formatters';

const ReportsPage = () => {
  const [year] = useState(new Date().getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getSummary,
  });

  const summary = data?.data;

  const exportCSV = () => {
    if (!summary) return;

    const rows = [
      ['Month', 'Revenue', 'Expenses', 'Profit'],
      ...summary.monthlyRevenue.map((rev, i) => [
        rev.month,
        rev.amount.toFixed(2),
        (summary.monthlyExpenses[i]?.amount ?? 0).toFixed(2),
        (rev.amount - (summary.monthlyExpenses[i]?.amount ?? 0)).toFixed(2),
      ]),
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optrixa-report-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6 h-32 bg-gray-100" />
        ))}
      </div>
    );
  }

  const totalRevenue = summary?.monthlyRevenue.reduce((s, m) => s + m.amount, 0) ?? 0;
  const totalExpenses = summary?.monthlyExpenses.reduce((s, m) => s + m.amount, 0) ?? 0;
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0
    ? ((totalProfit / totalRevenue) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">
            Business performance overview for {year}
          </p>
        </div>
        <button onClick={exportCSV} className="btn-primary flex items-center gap-2">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</div>
          <div className="text-xs text-gray-400 mt-1">Last 6 months</div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown size={20} className="text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Expenses</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{formatCurrency(totalExpenses)}</div>
          <div className="text-xs text-gray-400 mt-1">Last 6 months</div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Net Profit</span>
          </div>
          <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalProfit)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Margin: {profitMargin}%</div>
        </div>
      </div>

      {/* Monthly P&L Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">
            Monthly Profit & Loss
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Month</th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">Revenue</th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">Expenses</th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">Profit</th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summary?.monthlyRevenue.map((rev, i) => {
                const expense = summary.monthlyExpenses[i]?.amount ?? 0;
                const profit = rev.amount - expense;
                const margin = rev.amount > 0
                  ? ((profit / rev.amount) * 100).toFixed(1)
                  : '0';
                return (
                  <tr key={rev.month} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{rev.month}</td>
                    <td className="px-6 py-4 text-right text-green-600 font-medium">
                      {formatCurrency(rev.amount)}
                    </td>
                    <td className="px-6 py-4 text-right text-red-500">
                      {formatCurrency(expense)}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(profit)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={profit >= 0 ? 'badge-success' : 'badge-danger'}>
                        {margin}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td className="px-6 py-4 font-bold text-gray-800">Total</td>
                <td className="px-6 py-4 text-right font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </td>
                <td className="px-6 py-4 text-right font-bold text-red-500">
                  {formatCurrency(totalExpenses)}
                </td>
                <td className={`px-6 py-4 text-right font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalProfit)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={totalProfit >= 0 ? 'badge-success' : 'badge-danger'}>
                    {profitMargin}%
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Inventory Valuation */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Inventory Snapshot
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-800">
              {summary?.totalProducts ?? 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Total Products</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {summary?.lowStockCount ?? 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Low Stock Items</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600">
              {summary?.totalSalesThisMonth ?? 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Sales This Month</div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-indigo-600">
              {formatCurrency(summary?.revenueThisMonth ?? 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Revenue This Month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;