// Features/Sales/Commands/UpdateSaleStatusCommand.cs
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Sales.DTOs;

namespace Optrixa.Application.Features.Sales.Commands;

public record UpdateSaleStatusCommand(int Id, string Status)
    : IRequest<ApiResponse<SaleDto>>;