// Features/Products/Commands/CreateProductCommandHandler.cs
using AutoMapper;
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Products.DTOs;
using Optrixa.Domain.Entities;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Products.Commands;

public class CreateProductCommandHandler
    : IRequestHandler<CreateProductCommand, ApiResponse<ProductDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CreateProductCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ApiResponse<ProductDto>> Handle(
    CreateProductCommand request, CancellationToken cancellationToken)
{
    var skuExists = await _uow.Products.IsSkuUniqueAsync(request.Dto.SKU);
    if (!skuExists)
        return ApiResponse<ProductDto>.Fail("A product with this SKU already exists.");

    var product = new Product
    {
        Name = request.Dto.Name,
        SKU = request.Dto.SKU,
        Description = request.Dto.Description,
        CategoryId = request.Dto.CategoryId,
        SupplierId = request.Dto.SupplierId,
        CostPrice = request.Dto.CostPrice,
        SellingPrice = request.Dto.SellingPrice,
        StockQuantity = request.Dto.StockQuantity,
        LowStockThreshold = request.Dto.LowStockThreshold,
    };

    await _uow.Products.AddAsync(product);
    await _uow.SaveChangesAsync();

    // Reload with category and supplier included
    var created = await _uow.Products.GetWithCategoryAndSupplierByIdAsync(product.Id);
    var productDto = _mapper.Map<ProductDto>(created);
    return ApiResponse<ProductDto>.Ok(productDto, "Product created successfully.");
}
}