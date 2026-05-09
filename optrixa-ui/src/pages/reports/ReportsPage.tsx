import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Download, TrendingUp, TrendingDown,
  DollarSign, ChevronDown, ChevronRight,
  ChevronUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { dashboardApi } from '../../api/dashboardApi';
import { formatCurrency } from '../../utils/formatters';
import PeriodSelector from '../../components/ui/PeriodSelector';
import { useDateRange } from '../../hooks/useDateRange';

// Helper — parse "MMM yyyy" to { year, month }
const parseMonthLabel = (label: string): { year: number; month: number } => {
  const date = new Date(`${label} 01`);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
};

// Daily breakdown sub-component
const DailyBreakdown = ({
  year,
  month,
}: {
  year: number;
  month: number;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['daily-breakdown', year, month],
    queryFn: () => dashboardApi.getDailyBreakdown(year, month),
  });

  const days = data?.data?.days ?? [];

  // Only show days with activity or all days
  const [showAll, setShowAll] = useState(false);
  const activeDays = days.filter(
    (d) => d.revenue > 0 || d.expenses > 0
  );
  const displayDays = showAll ? days : activeDays;

  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-400 mt-2">
          Loading daily data...
        </p>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-gray-400">
        No data available for this month.
      </div>
    );
  }

  // Chart data
  const chartData = displayDays.map((d) => ({
    day: `${d.dayName} ${d.day}`,
    Revenue: d.revenue,
    Expenses: d.expenses,
    Profit: d.profit,
  }));

  return (
    <div className="space-y-4">
      {/* Mini Chart */}
      {displayDays.some((d) => d.revenue > 0 || d.expenses > 0) && (
        <div className="bg-white rounded-xl border border-indigo-100 p-4">
          <p className="text-xs font-medium text-gray-500 mb-3">
            Daily Revenue vs Expenses
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="Revenue"
                fill="#6366f1"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="Expenses"
                fill="#ef4444"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daily Table */}
      <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-2.5 text-gray-500 font-medium">
                Day
              </th>
              <th className="text-left px-4 py-2.5 text-gray-500 font-medium">
                Date
              </th>
              <th className="text-right px-4 py-2.5 text-gray-500 font-medium">
                Revenue
              </th>
              <th className="text-right px-4 py-2.5 text-gray-500 font-medium">
                Expenses
              </th>
              <th className="text-right px-4 py-2.5 text-gray-500 font-medium">
                Profit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayDays.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-400"
                >
                  No transactions recorded this month.
                </td>
              </tr>
            ) : (
              displayDays.map((d) => (
                <tr
                  key={d.day}
                  className={`transition-colors ${
                    d.revenue > 0 || d.expenses > 0
                      ? 'hover:bg-indigo-50/30'
                      : 'opacity-40'
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-gray-600">
                      {d.dayName}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {d.date}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {d.revenue > 0 ? (
                      <span className="text-green-600 font-medium">
                        {formatCurrency(d.revenue)}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {d.expenses > 0 ? (
                      <span className="text-red-500">
                        {formatCurrency(d.expenses)}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {d.revenue > 0 || d.expenses > 0 ? (
                      <span
                        className={`font-semibold ${
                          d.profit >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(d.profit)}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Toggle active/all days */}
      {activeDays.length !== days.length && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
        >
          {showAll ? (
            <>
              <ChevronUp size={12} />
              Show active days only ({activeDays.length} days)
            </>
          ) : (
            <>
              <ChevronDown size={12} />
              Show all {days.length} days (
              {days.length - activeDays.length} with no activity)
            </>
          )}
        </button>
      )}
    </div>
  );
};

// ── Main Reports Page ──────────────────────────────────────────
const ReportsPage = () => {
  const {
    period,
    setPeriod,
    fromDate,
    toDate,
    label,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
  } = useDateRange('month');

  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', period, fromDate, toDate],
    queryFn: () => dashboardApi.getSummary({ fromDate, toDate }),
  });

  const summary = data?.data;

  const exportCSV = () => {
    if (!summary) return;

    const rows = [
      ['Month', 'Revenue', 'Expenses', 'Profit', 'Margin %'],
      ...summary.monthlyRevenue.map((rev, i) => {
        const expense = summary.monthlyExpenses[i]?.amount ?? 0;
        const profit = rev.amount - expense;
        const margin =
          rev.amount > 0
            ? ((profit / rev.amount) * 100).toFixed(1)
            : '0';
        return [
          rev.month,
          rev.amount.toFixed(2),
          expense.toFixed(2),
          profit.toFixed(2),
          margin,
        ];
      }),
    ];

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optrixa-report-${label.replace(/\s/g, '-')}.csv`;
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

  const totalRevenue =
    summary?.monthlyRevenue.reduce((s, m) => s + m.amount, 0) ?? 0;
  const totalExpenses =
    summary?.monthlyExpenses.reduce((s, m) => s + m.amount, 0) ?? 0;
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin =
    totalRevenue > 0
      ? ((totalProfit / totalRevenue) * 100).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">
            Business performance —{' '}
            <span className="font-medium text-indigo-600">{label}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <PeriodSelector
            value={period}
            onChange={setPeriod}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFromChange={setCustomFrom}
            onCustomToChange={setCustomTo}
            label={label}
          />
          <button
            onClick={exportCSV}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Total Revenue
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-xs text-gray-400 mt-1">{label}</div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown size={20} className="text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Total Expenses
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="text-xs text-gray-400 mt-1">{label}</div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Net Profit
            </span>
          </div>
          <div
            className={`text-2xl font-bold ${
              totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(totalProfit)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Margin: {profitMargin}%
          </div>
        </div>
      </div>

      {/* Monthly P&L Table — with expandable rows */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              Monthly Profit & Loss
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Click any month row to see a day-by-day breakdown
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 px-3 py-3" />
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Month
                </th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">
                  Revenue
                </th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">
                  Expenses
                </th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">
                  Profit
                </th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">
                  Margin
                </th>
              </tr>
            </thead>
            <tbody>
              {summary?.monthlyRevenue.map((rev, i) => {
                const expense = summary.monthlyExpenses[i]?.amount ?? 0;
                const profit = rev.amount - expense;
                const margin =
                  rev.amount > 0
                    ? ((profit / rev.amount) * 100).toFixed(1)
                    : '0';
                const isExpanded = expandedMonth === rev.month;
                const { year, month } = parseMonthLabel(rev.month);

                return (
                  <>
                    {/* Month Row */}
                    <tr
                      key={rev.month}
                      onClick={() =>
                        setExpandedMonth(
                          isExpanded ? null : rev.month
                        )
                      }
                      className={`cursor-pointer transition-colors border-b border-gray-100 ${
                        isExpanded
                          ? 'bg-indigo-50/50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-3 py-4">
                        <span className="text-gray-400">
                          {isExpanded ? (
                            <ChevronDown size={15} />
                          ) : (
                            <ChevronRight size={15} />
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          {rev.month}
                          <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100">
                            click to expand
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-green-600 font-medium">
                        {formatCurrency(rev.amount)}
                      </td>
                      <td className="px-6 py-4 text-right text-red-500">
                        {formatCurrency(expense)}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-semibold ${
                          profit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(profit)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={
                            profit >= 0 ? 'badge-success' : 'badge-danger'
                          }
                        >
                          {margin}%
                        </span>
                      </td>
                    </tr>

                    {/* Expanded — Daily Breakdown */}
                    {isExpanded && (
                      <tr key={`${rev.month}-expanded`}>
                        <td
                          colSpan={6}
                          className="px-8 py-4 bg-indigo-50/20 border-b border-indigo-100"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                              Daily Breakdown — {rev.month}
                            </span>
                          </div>
                          <DailyBreakdown year={year} month={month} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>

            {/* Totals Footer */}
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td />
                <td className="px-6 py-4 font-bold text-gray-800">
                  Total
                </td>
                <td className="px-6 py-4 text-right font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </td>
                <td className="px-6 py-4 text-right font-bold text-red-500">
                  {formatCurrency(totalExpenses)}
                </td>
                <td
                  className={`px-6 py-4 text-right font-bold ${
                    totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(totalProfit)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={
                      totalProfit >= 0 ? 'badge-success' : 'badge-danger'
                    }
                  >
                    {profitMargin}%
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Inventory Snapshot */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Inventory Snapshot
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-800">
              {summary?.totalProducts ?? 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Total Products
            </div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {summary?.lowStockCount ?? 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Low Stock Items
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600">
              {summary?.totalSalesThisMonth ?? 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Sales — {label}
            </div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-indigo-600">
              {formatCurrency(summary?.revenueThisMonth ?? 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Revenue — {label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;