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
    GetDashboardSummaryQuery request,
    CancellationToken cancellationToken)
{
    var now = DateTime.UtcNow;
    var todayStart = now.Date;
    var todayEnd = todayStart.AddDays(1);

    // Use provided dates or default to current month
    var periodStart = request.FromDate?.ToUniversalTime()
        ?? new DateTime(now.Year, now.Month, 1);
    var periodEnd = request.ToDate?.ToUniversalTime()
        ?? new DateTime(now.Year, now.Month + 1, 1);

    // Revenue for selected period
    var revenueToday = await _uow.Sales
        .GetTotalRevenueAsync(todayStart, todayEnd);
    var revenuePeriod = await _uow.Sales
        .GetTotalRevenueAsync(periodStart, periodEnd);

    // Expenses for selected period
    var expensesToday = await _uow.Expenses
        .GetTotalExpensesAsync(todayStart, todayEnd);
    var expensesPeriod = await _uow.Expenses
        .GetTotalExpensesAsync(periodStart, periodEnd);

    // Products
    var allProducts = await _uow.Products.GetAllAsync();
    var lowStockProducts = await _uow.Products.GetLowStockProductsAsync();

    // Sales counts for period
    var salesToday = await _uow.Sales
        .GetByDateRangeAsync(todayStart, todayEnd);
    var salesPeriod = await _uow.Sales
        .GetByDateRangeAsync(periodStart, periodEnd);

    // Monthly chart data (last 6 months always)
    var monthlyRevenue = new List<MonthlyDataPoint>();
    var monthlyExpenses = new List<MonthlyDataPoint>();

    for (int i = 5; i >= 0; i--)
    {
        var start = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
        var end = start.AddMonths(1);

        monthlyRevenue.Add(new MonthlyDataPoint
        {
            Month = start.ToString("MMM yyyy"),
            Amount = await _uow.Sales.GetTotalRevenueAsync(start, end)
        });

        monthlyExpenses.Add(new MonthlyDataPoint
        {
            Month = start.ToString("MMM yyyy"),
            Amount = await _uow.Expenses.GetTotalExpensesAsync(start, end)
        });
    }

    var summary = new DashboardSummaryDto
    {
        RevenueToday = revenueToday,
        RevenueThisMonth = revenuePeriod,
        ExpensesToday = expensesToday,
        ExpensesThisMonth = expensesPeriod,
        ProfitToday = revenueToday - expensesToday,
        ProfitThisMonth = revenuePeriod - expensesPeriod,
        TotalProducts = allProducts.Count(),
        LowStockCount = lowStockProducts.Count(),
        TotalSalesToday = salesToday.Count(),
        TotalSalesThisMonth = salesPeriod.Count(),
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