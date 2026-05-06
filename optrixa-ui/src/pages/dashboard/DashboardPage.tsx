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

const StatCard = ({
  title, value, icon: Icon, color, trend
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
  trend?: string;
}) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon size={22} className="text-white" />
      </div>
      {trend && (
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    <div className="text-sm text-gray-500 mt-1">{title}</div>
  </div>
);

const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getSummary,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6 h-32 bg-gray-100" />
        ))}
      </div>
    );
  }

  const summary = data?.data;

  // Combine monthly data for the chart
  const chartData = summary?.monthlyRevenue.map((rev, i) => ({
    month: rev.month,
    Revenue: rev.amount,
    Expenses: summary.monthlyExpenses[i]?.amount ?? 0,
    Profit: rev.amount - (summary.monthlyExpenses[i]?.amount ?? 0),
  })) ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back! Here's what's happening with your business.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(summary?.revenueThisMonth ?? 0)}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Expenses This Month"
          value={formatCurrency(summary?.expensesThisMonth ?? 0)}
          icon={TrendingDown}
          color="bg-red-500"
        />
        <StatCard
          title="Profit This Month"
          value={formatCurrency(summary?.profitThisMonth ?? 0)}
          icon={TrendingUp}
          color="bg-primary-500"
        />
        <StatCard
          title="Total Products"
          value={String(summary?.totalProducts ?? 0)}
          icon={Package}
          color="bg-purple-500"
        />
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart size={18} className="text-primary-600" />
            <span className="text-sm font-medium text-gray-600">Sales Today</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {summary?.totalSalesToday ?? 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formatCurrency(summary?.revenueToday ?? 0)} revenue
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={18} className="text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">Low Stock Alerts</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {summary?.lowStockCount ?? 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">products need restocking</div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={18} className="text-green-500" />
            <span className="text-sm font-medium text-gray-600">Sales This Month</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {summary?.totalSalesThisMonth ?? 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formatCurrency(summary?.revenueThisMonth ?? 0)} total
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Revenue vs Expenses
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
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Area type="monotone" dataKey="Revenue" stroke="#6366f1" fill="url(#colorRevenue)" strokeWidth={2} />
              <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="url(#colorExpenses)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Chart */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Monthly Profit
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="Profit" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
                  <th className="text-left py-2 text-gray-500 font-medium">Product</th>
                  <th className="text-left py-2 text-gray-500 font-medium">SKU</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Stock</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {summary?.lowStockProducts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="py-2 font-medium text-gray-800">{p.name}</td>
                    <td className="py-2 text-gray-500">{p.sku}</td>
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