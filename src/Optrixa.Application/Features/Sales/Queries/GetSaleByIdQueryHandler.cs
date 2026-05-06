// Features/Sales/Queries/GetSaleByIdQueryHandler.cs
using AutoMapper;
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Sales.DTOs;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Sales.Queries;

public class GetSaleByIdQueryHandler
    : IRequestHandler<GetSaleByIdQuery, ApiResponse<SaleDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetSaleByIdQueryHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ApiResponse<SaleDto>> Handle(
        GetSaleByIdQuery request, CancellationToken cancellationToken)
    {
        var sale = await _uow.Sales.GetWithItemsAsync(request.Id);
        if (sale is null)
            return ApiResponse<SaleDto>.Fail("Sale not found.");

        return ApiResponse<SaleDto>.Ok(_mapper.Map<SaleDto>(sale));
    }
}