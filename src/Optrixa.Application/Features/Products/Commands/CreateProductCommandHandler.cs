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
        // 1. Business rule: SKU must be unique
        var skuExists = await _uow.Products.IsSkuUniqueAsync(request.Dto.SKU);
        if (!skuExists)
            return ApiResponse<ProductDto>.Fail("A product with this SKU already exists.");

        // 2. Map DTO → Entity
        var product = _mapper.Map<Product>(request.Dto);

        // 3. Persist
        await _uow.Products.AddAsync(product);
        await _uow.SaveChangesAsync();

        // 4. Return the created product as a DTO
        var productDto = _mapper.Map<ProductDto>(product);
        return ApiResponse<ProductDto>.Ok(productDto, "Product created successfully.");
    }
}