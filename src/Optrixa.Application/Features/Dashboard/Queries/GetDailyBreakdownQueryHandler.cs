using MediatR;
using Optrixa.Application.Common;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Dashboard.Queries;

public class GetDailyBreakdownQueryHandler
    : IRequestHandler<GetDailyBreakdownQuery, ApiResponse<DailyBreakdownDto>>
{
    private readonly IUnitOfWork _uow;

    public GetDailyBreakdownQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<DailyBreakdownDto>> Handle(
        GetDailyBreakdownQuery request,
        CancellationToken cancellationToken)
    {
        var daysInMonth = DateTime.DaysInMonth(request.Year, request.Month);
        var days = new List<DailyDataPoint>();

        for (int day = 1; day <= daysInMonth; day++)
        {
            var date = new DateTime(request.Year, request.Month, day);

            // Skip future dates
            if (date.Date > DateTime.UtcNow.Date) break;

            var dayStart = date;
            var dayEnd = date.AddDays(1);

            var revenue = await _uow.Sales
                .GetTotalRevenueAsync(dayStart, dayEnd);
            var expenses = await _uow.Expenses
                .GetTotalExpensesAsync(dayStart, dayEnd);

            days.Add(new DailyDataPoint
            {
                Day = day,
                Date = date.ToString("MMM dd, yyyy"),
                DayName = date.ToString("ddd"),
                Revenue = revenue,
                Expenses = expenses,
                Profit = revenue - expenses,
            });
        }

        var totalRevenue = days.Sum(d => d.Revenue);
        var totalExpenses = days.Sum(d => d.Expenses);

        return ApiResponse<DailyBreakdownDto>.Ok(new DailyBreakdownDto
        {
            Month = new DateTime(request.Year, request.Month, 1)
                .ToString("MMMM yyyy"),
            Days = days,
            TotalRevenue = totalRevenue,
            TotalExpenses = totalExpenses,
            TotalProfit = totalRevenue - totalExpenses,
        });
    }
}