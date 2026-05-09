using MediatR;
using Optrixa.Application.Common;

namespace Optrixa.Application.Features.Dashboard.Queries;

public record GetDailyBreakdownQuery(int Year, int Month)
    : IRequest<ApiResponse<DailyBreakdownDto>>;

public class DailyBreakdownDto
{
    public string Month { get; set; } = string.Empty;
    public List<DailyDataPoint> Days { get; set; } = new();
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal TotalProfit { get; set; }
}

public class DailyDataPoint
{
    public int Day { get; set; }
    public string Date { get; set; } = string.Empty;
    public string DayName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public decimal Expenses { get; set; }
    public decimal Profit { get; set; }
}