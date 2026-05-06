// Features/Dashboard/Queries/DashboardSummaryDto.cs
namespace Optrixa.Application.Features.Dashboard.Queries;

public class DashboardSummaryDto
{
    public decimal RevenueToday { get; set; }
    public decimal RevenueThisMonth { get; set; }
    public decimal ExpensesToday { get; set; }
    public decimal ExpensesThisMonth { get; set; }
    public decimal ProfitToday { get; set; }
    public decimal ProfitThisMonth { get; set; }
    public int TotalProducts { get; set; }
    public int LowStockCount { get; set; }
    public int TotalSalesToday { get; set; }
    public int TotalSalesThisMonth { get; set; }
    public List<MonthlyDataPoint> MonthlyRevenue { get; set; } = new();
    public List<MonthlyDataPoint> MonthlyExpenses { get; set; } = new();
    public List<LowStockProduct> LowStockProducts { get; set; } = new();
}

public class MonthlyDataPoint
{
    public string Month { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class LowStockProduct
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; }
}