// Features/Products/Commands/DeleteProductCommandHandler.cs
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Products.Commands;

public class DeleteProductCommandHandler
    : IRequestHandler<DeleteProductCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _uow;

    public DeleteProductCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<bool>> Handle(
        DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _uow.Products.GetByIdAsync(request.Id);
        if (product is null)
            return ApiResponse<bool>.Fail("Product not found.");

        // Soft delete — sets IsDeleted = true, row stays in DB
        product.IsDeleted = true;
        product.UpdatedAt = DateTime.UtcNow;
        await _uow.Products.UpdateAsync(product);
        await _uow.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Product deleted.");
    }
}