// Features/Dashboard/Queries/GetDashboardSummaryQuery.cs
using MediatR;
using Optrixa.Application.Common;

namespace Optrixa.Application.Features.Dashboard.Queries;

public record GetDashboardSummaryQuery(
    DateTime? FromDate = null,
    DateTime? ToDate = null)
    : IRequest<ApiResponse<DashboardSummaryDto>>;