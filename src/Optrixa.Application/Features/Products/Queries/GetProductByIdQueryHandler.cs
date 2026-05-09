using AutoMapper;
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Products.DTOs;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Products.Queries;

public class GetProductByIdQueryHandler
    : IRequestHandler<GetProductByIdQuery, ApiResponse<ProductDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetProductByIdQueryHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ApiResponse<ProductDto>> Handle(
    GetProductByIdQuery request, CancellationToken cancellationToken)
{
    var product = await _uow.Products
        .GetWithCategoryAndSupplierByIdAsync(request.Id);

    if (product is null)
        return ApiResponse<ProductDto>.Fail("Product not found.");

    return ApiResponse<ProductDto>.Ok(_mapper.Map<ProductDto>(product));
}
}