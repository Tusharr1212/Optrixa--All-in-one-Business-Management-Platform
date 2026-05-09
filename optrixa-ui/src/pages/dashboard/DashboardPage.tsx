import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign,
  Package, ShoppingCart, AlertTriangle
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { formatCurrency } from '../../utils/formatters';
import StatCard from '../../components/ui/StatCard';
import PeriodSelector from '../../components/ui/PeriodSelector';
import { useDateRange } from '../../hooks/useDateRange';

const DashboardPage = () => {
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
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => dashboardApi.getSummary({ fromDate, toDate }),
  });

  const summary = data?.data;

  const chartData = summary?.monthlyRevenue.map((rev, i) => ({
    month: rev.month,
    Revenue: rev.amount,
    Expenses: summary.monthlyExpenses[i]?.amount ?? 0,
    Profit: rev.amount - (summary.monthlyExpenses[i]?.amount ?? 0),
  })) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 h-32 bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Showing data for{' '}
            <span className="font-medium text-indigo-600">{label}</span>
          </p>
        </div>
        <PeriodSelector
          value={period}
          onChange={setPeriod}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
          label={label}
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={`Revenue — ${label}`}
          value={formatCurrency(summary?.revenueThisMonth ?? 0)}
          icon={DollarSign}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          subtitle={`Today: ${formatCurrency(summary?.revenueToday ?? 0)}`}
        />
        <StatCard
          title={`Expenses — ${label}`}
          value={formatCurrency(summary?.expensesThisMonth ?? 0)}
          icon={TrendingDown}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          subtitle={`Today: ${formatCurrency(summary?.expensesToday ?? 0)}`}
        />
        <StatCard
          title={`Net Profit — ${label}`}
          value={formatCurrency(summary?.profitThisMonth ?? 0)}
          icon={TrendingUp}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
          subtitle={`Today: ${formatCurrency(summary?.profitToday ?? 0)}`}
        />
        <StatCard
          title="Total Products"
          value={String(summary?.totalProducts ?? 0)}
          icon={Package}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          subtitle={`${summary?.lowStockCount ?? 0} low stock alerts`}
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart size={18} className="text-indigo-600" />
            <span className="text-sm font-medium text-gray-600">
              Sales — {label}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {summary?.totalSalesThisMonth ?? 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formatCurrency(summary?.revenueThisMonth ?? 0)} revenue
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={18} className="text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">
              Low Stock Alerts
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {summary?.lowStockCount ?? 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            products need restocking
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={18} className="text-green-500" />
            <span className="text-sm font-medium text-gray-600">
              Today's Sales
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {summary?.totalSalesToday ?? 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formatCurrency(summary?.revenueToday ?? 0)} today
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Revenue vs Expenses (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="Revenue"
                stroke="#6366f1"
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Expenses"
                stroke="#ef4444"
                fill="url(#colorExpenses)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Monthly Profit
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar
                dataKey="Profit"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Table */}
      {(summary?.lowStockProducts?.length ?? 0) > 0 && (
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-yellow-500" />
            Low Stock Products
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">
                    Product
                  </th>
                  <th className="text-left py-2 text-gray-500 font-medium">
                    SKU
                  </th>
                  <th className="text-left py-2 text-gray-500 font-medium">
                    Stock
                  </th>
                  <th className="text-left py-2 text-gray-500 font-medium">
                    Threshold
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary?.lowStockProducts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="py-2 font-medium text-gray-800">
                      {p.name}
                    </td>
                    <td className="py-2 text-gray-500 font-mono text-xs">
                      {p.sku}
                    </td>
                    <td className="py-2">
                      <span className="badge-danger">{p.stockQuantity}</span>
                    </td>
                    <td className="py-2 text-gray-500">{p.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;