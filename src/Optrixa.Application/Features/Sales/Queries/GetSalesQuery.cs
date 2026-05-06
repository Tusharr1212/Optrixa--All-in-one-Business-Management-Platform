// Features/Sales/Queries/GetSalesQuery.cs
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Sales.DTOs;

namespace Optrixa.Application.Features.Sales.Queries;

public record GetSalesQuery(PaginationParams Params)
    : IRequest<ApiResponse<PaginatedResult<SaleDto>>>;