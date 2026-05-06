// Features/Sales/Commands/UpdateSaleStatusCommandHandler.cs
using AutoMapper;
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Sales.DTOs;
using Optrixa.Domain.Enums;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Sales.Commands;

public class UpdateSaleStatusCommandHandler
    : IRequestHandler<UpdateSaleStatusCommand, ApiResponse<SaleDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public UpdateSaleStatusCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ApiResponse<SaleDto>> Handle(
        UpdateSaleStatusCommand request, CancellationToken cancellationToken)
    {
        var sale = await _uow.Sales.GetWithItemsAsync(request.Id);
        if (sale is null)
            return ApiResponse<SaleDto>.Fail("Sale not found.");

        // Parse status string to enum
        if (!Enum.TryParse<PaymentStatus>(request.Status, out var status))
            return ApiResponse<SaleDto>.Fail("Invalid payment status.");

        sale.PaymentStatus = status;
        sale.UpdatedAt = DateTime.UtcNow;

        await _uow.Sales.UpdateAsync(sale);
        await _uow.SaveChangesAsync();

        return ApiResponse<SaleDto>.Ok(_mapper.Map<SaleDto>(sale), "Status updated.");
    }
}