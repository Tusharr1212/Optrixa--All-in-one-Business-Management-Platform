// Features/Sales/Queries/GetSalesQueryHandler.cs
using AutoMapper;
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Sales.DTOs;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Sales.Queries;

public class GetSalesQueryHandler
    : IRequestHandler<GetSalesQuery, ApiResponse<PaginatedResult<SaleDto>>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetSalesQueryHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ApiResponse<PaginatedResult<SaleDto>>> Handle(
        GetSalesQuery request, CancellationToken cancellationToken)
    {
        var p = request.Params;
        var sales = await _uow.Sales.GetByDateRangeAsync(
            p.FromDate ?? DateTime.UtcNow.AddMonths(-1),
            p.ToDate ?? DateTime.UtcNow);

        var totalCount = sales.Count();
        var items = sales
            .Skip((p.Page - 1) * p.PageSize)
            .Take(p.PageSize)
            .Select(x => _mapper.Map<SaleDto>(x));

        return ApiResponse<PaginatedResult<SaleDto>>.Ok(new PaginatedResult<SaleDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = p.Page,
            PageSize = p.PageSize
        });
    }
}