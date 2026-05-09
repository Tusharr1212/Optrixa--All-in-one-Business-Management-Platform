export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
  fromDate?: string;
  toDate?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  type: string;
}

export interface DashboardSummary {
  revenueToday: number;
  revenueThisMonth: number;
  expensesToday: number;
  expensesThisMonth: number;
  profitToday: number;
  profitThisMonth: number;
  totalProducts: number;
  lowStockCount: number;
  totalSalesToday: number;
  totalSalesThisMonth: number;
  monthlyRevenue: MonthlyDataPoint[];
  monthlyExpenses: MonthlyDataPoint[];
  lowStockProducts: LowStockProduct[];
}

export interface MonthlyDataPoint {
  month: string;
  amount: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

export interface DailyDataPoint {
  day: number;
  date: string;
  dayName: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface DailyBreakdownDto {
  month: string;
  days: DailyDataPoint[];
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
}