// Features/Sales/Queries/GetSaleByIdQuery.cs
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Sales.DTOs;

namespace Optrixa.Application.Features.Sales.Queries;

public record GetSaleByIdQuery(int Id) : IRequest<ApiResponse<SaleDto>>;