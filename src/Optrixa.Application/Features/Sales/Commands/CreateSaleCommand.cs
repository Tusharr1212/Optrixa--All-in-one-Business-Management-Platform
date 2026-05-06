// Features/Sales/Commands/CreateSaleCommand.cs
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Sales.DTOs;

namespace Optrixa.Application.Features.Sales.Commands;

public record CreateSaleCommand(CreateSaleDto Dto, string UserId)
    : IRequest<ApiResponse<SaleDto>>;