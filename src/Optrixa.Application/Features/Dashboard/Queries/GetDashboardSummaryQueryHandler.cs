// Features/Dashboard/Queries/GetDashboardSummaryQueryHandler.cs
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Dashboard.Queries;

public class GetDashboardSummaryQueryHandler
    : IRequestHandler<GetDashboardSummaryQuery, ApiResponse<DashboardSummaryDto>>
{
    private readonly IUnitOfWork _uow;

    public GetDashboardSummaryQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<DashboardSummaryDto>> Handle(
        GetDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var todayEnd = todayStart.AddDays(1);
        var monthStart = new DateTime(now.Year, now.Month, 1);
        var monthEnd = monthStart.AddMonths(1);

        // Revenue
        var revenueToday = await _uow.Sales.GetTotalRevenueAsync(todayStart, todayEnd);
        var revenueMonth = await _uow.Sales.GetTotalRevenueAsync(monthStart, monthEnd);

        // Expenses
        var expensesToday = await _uow.Expenses.GetTotalExpensesAsync(todayStart, todayEnd);
        var expensesMonth = await _uow.Expenses.GetTotalExpensesAsync(monthStart, monthEnd);

        // Products
        var allProducts = await _uow.Products.GetAllAsync();
        var lowStockProducts = await _uow.Products.GetLowStockProductsAsync();

        // Sales counts
        var salesToday = await _uow.Sales.GetByDateRangeAsync(todayStart, todayEnd);
        var salesMonth = await _uow.Sales.GetByDateRangeAsync(monthStart, monthEnd);

        // Monthly chart data (last 6 months)
        var monthlyRevenue = new List<MonthlyDataPoint>();
        var monthlyExpenses = new List<MonthlyDataPoint>();

        for (int i = 5; i >= 0; i--)
        {
            var start = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
            var end = start.AddMonths(1);
            var monthName = start.ToString("MMM yyyy");

            monthlyRevenue.Add(new MonthlyDataPoint
            {
                Month = monthName,
                Amount = await _uow.Sales.GetTotalRevenueAsync(start, end)
            });

            monthlyExpenses.Add(new MonthlyDataPoint
            {
                Month = monthName,
                Amount = await _uow.Expenses.GetTotalExpensesAsync(start, end)
            });
        }

        var summary = new DashboardSummaryDto
        {
            RevenueToday = revenueToday,
            RevenueThisMonth = revenueMonth,
            ExpensesToday = expensesToday,
            ExpensesThisMonth = expensesMonth,
            ProfitToday = revenueToday - expensesToday,
            ProfitThisMonth = revenueMonth - expensesMonth,
            TotalProducts = allProducts.Count(),
            LowStockCount = lowStockProducts.Count(),
            TotalSalesToday = salesToday.Count(),
            TotalSalesThisMonth = salesMonth.Count(),
            MonthlyRevenue = monthlyRevenue,
            MonthlyExpenses = monthlyExpenses,
            LowStockProducts = lowStockProducts.Select(p => new LowStockProduct
            {
                Id = p.Id,
                Name = p.Name,
                SKU = p.SKU,
                StockQuantity = p.StockQuantity,
                LowStockThreshold = p.LowStockThreshold
            }).ToList()
        };

        return ApiResponse<DashboardSummaryDto>.Ok(summary);
    }
}