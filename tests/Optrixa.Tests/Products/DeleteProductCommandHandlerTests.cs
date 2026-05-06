using Moq;
using Optrixa.Application.Features.Products.Commands;
using Optrixa.Domain.Entities;
using Optrixa.Domain.Interfaces;
using Xunit;

namespace Optrixa.Tests.Products;

public class DeleteProductCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly Mock<IProductRepository> _productRepoMock;
    private readonly DeleteProductCommandHandler _handler;

    public DeleteProductCommandHandlerTests()
    {
        _uowMock = new Mock<IUnitOfWork>();
        _productRepoMock = new Mock<IProductRepository>();
        _uowMock.Setup(u => u.Products).Returns(_productRepoMock.Object);
        _handler = new DeleteProductCommandHandler(_uowMock.Object);
    }

    [Fact]
    public async Task Handle_ExistingProduct_SoftDeletesAndReturnsSuccess()
    {
        var product = new Product
        {
            Id = 1,
            Name = "Test Product",
            SKU = "TEST-001",
            IsDeleted = false
        };

        _productRepoMock
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(product);

        _uowMock
            .Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        var result = await _handler.Handle(
            new DeleteProductCommand(1), CancellationToken.None);

        Assert.True(result.Success);
        Assert.True(product.IsDeleted);

        // Must be soft deleted not hard deleted
        _productRepoMock.Verify(
            r => r.DeleteAsync(It.IsAny<Product>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_NonExistentProduct_ReturnsFailure()
    {
        _productRepoMock
            .Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Product?)null);

        var result = await _handler.Handle(
            new DeleteProductCommand(999), CancellationToken.None);

        Assert.False(result.Success);
        Assert.Contains("not found", result.Message);
    }
}