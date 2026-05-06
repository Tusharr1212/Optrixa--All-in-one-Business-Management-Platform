// Features/Products/Commands/UpdateProductCommandHandler.cs
using AutoMapper;
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Products.DTOs;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Products.Commands;

public class UpdateProductCommandHandler
    : IRequestHandler<UpdateProductCommand, ApiResponse<ProductDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public UpdateProductCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ApiResponse<ProductDto>> Handle(
        UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _uow.Products.GetByIdAsync(request.Dto.Id);
        if (product is null)
            return ApiResponse<ProductDto>.Fail("Product not found.");

        if (!await _uow.Products.IsSkuUniqueAsync(request.Dto.SKU, request.Dto.Id))
            return ApiResponse<ProductDto>.Fail("A product with this SKU already exists.");

        _mapper.Map(request.Dto, product);
        product.UpdatedAt = DateTime.UtcNow;

        await _uow.Products.UpdateAsync(product);
        await _uow.SaveChangesAsync();

        return ApiResponse<ProductDto>.Ok(_mapper.Map<ProductDto>(product), "Product updated.");
    }
}