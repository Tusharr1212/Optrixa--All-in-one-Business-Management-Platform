// Features/Products/Queries/GetProductsQueryHandler.cs
using AutoMapper;
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Products.DTOs;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Products.Queries;

public class GetProductsQueryHandler
    : IRequestHandler<GetProductsQuery, ApiResponse<PaginatedResult<ProductDto>>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetProductsQueryHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ApiResponse<PaginatedResult<ProductDto>>> Handle(
        GetProductsQuery request, CancellationToken cancellationToken)
    {
        var p = request.Params;
        var products = await _uow.Products.GetWithCategoryAndSupplierAsync();

        // Apply search
        if (!string.IsNullOrWhiteSpace(p.SearchTerm))
        {
            var term = p.SearchTerm.ToLower();
            products = products.Where(x =>
                x.Name.ToLower().Contains(term) ||
                x.SKU.ToLower().Contains(term) ||
                (x.Category.Name.ToLower().Contains(term)));
        }

        // Apply sorting
        products = p.SortBy?.ToLower() switch
        {
            "name"     => p.SortDescending ? products.OrderByDescending(x => x.Name)     : products.OrderBy(x => x.Name),
            "stock"    => p.SortDescending ? products.OrderByDescending(x => x.StockQuantity) : products.OrderBy(x => x.StockQuantity),
            "price"    => p.SortDescending ? products.OrderByDescending(x => x.SellingPrice)  : products.OrderBy(x => x.SellingPrice),
            _          => products.OrderByDescending(x => x.CreatedAt)
        };

        var totalCount = products.Count();
        var items = products
            .Skip((p.Page - 1) * p.PageSize)
            .Take(p.PageSize)
            .Select(x => _mapper.Map<ProductDto>(x));

        var result = new PaginatedResult<ProductDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = p.Page,
            PageSize = p.PageSize
        };

        return ApiResponse<PaginatedResult<ProductDto>>.Ok(result);
    }
}