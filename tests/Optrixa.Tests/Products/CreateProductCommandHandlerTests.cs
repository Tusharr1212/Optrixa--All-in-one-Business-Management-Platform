using Moq;
using Optrixa.Application.Features.Products.Commands;
using Optrixa.Application.Features.Products.DTOs;
using Optrixa.Domain.Entities;
using Optrixa.Domain.Interfaces;
using Xunit;

namespace Optrixa.Tests.Products;

public class CreateProductCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly Mock<IProductRepository> _productRepoMock;
    private readonly CreateProductCommandHandler _handler;

    public CreateProductCommandHandlerTests()
    {
        _uowMock = new Mock<IUnitOfWork>();
        _productRepoMock = new Mock<IProductRepository>();
        _uowMock.Setup(u => u.Products).Returns(_productRepoMock.Object);

        // Use the Application layer's mapper directly
        var mapperConfig = new AutoMapper.MapperConfiguration(cfg =>
            cfg.AddProfile<Optrixa.Application.Mappings.MappingProfile>());
        var mapper = mapperConfig.CreateMapper();

        _handler = new CreateProductCommandHandler(_uowMock.Object, mapper);
    }

    [Fact]
    public async Task Handle_ValidProduct_ReturnsSuccess()
    {
        var dto = new CreateProductDto
        {
            Name = "Test Product",
            SKU = "TEST-001",
            CostPrice = 10.00m,
            SellingPrice = 20.00m,
            StockQuantity = 100,
            LowStockThreshold = 10,
            CategoryId = 1
        };

        _productRepoMock
            .Setup(r => r.IsSkuUniqueAsync(dto.SKU, null))
            .ReturnsAsync(true);

        _productRepoMock
            .Setup(r => r.AddAsync(It.IsAny<Product>()))
            .ReturnsAsync((Product p) => p);

        _uowMock
            .Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        var result = await _handler.Handle(
            new CreateProductCommand(dto), CancellationToken.None);

        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Test Product", result.Data!.Name);
        Assert.Equal("TEST-001", result.Data.SKU);
    }

    [Fact]
    public async Task Handle_DuplicateSKU_ReturnsFailure()
    {
        var dto = new CreateProductDto
        {
            Name = "Test Product",
            SKU = "DUPLICATE-001",
            CostPrice = 10.00m,
            SellingPrice = 20.00m,
            StockQuantity = 100,
            CategoryId = 1
        };

        _productRepoMock
            .Setup(r => r.IsSkuUniqueAsync(dto.SKU, null))
            .ReturnsAsync(false);

        var result = await _handler.Handle(
            new CreateProductCommand(dto), CancellationToken.None);

        Assert.False(result.Success);
        Assert.Contains("SKU", result.Message);

        _productRepoMock.Verify(
            r => r.AddAsync(It.IsAny<Product>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_ValidProduct_CallsSaveChanges()
    {
        var dto = new CreateProductDto
        {
            Name = "Test Product",
            SKU = "TEST-002",
            CostPrice = 10.00m,
            SellingPrice = 20.00m,
            StockQuantity = 50,
            CategoryId = 1
        };

        _productRepoMock
            .Setup(r => r.IsSkuUniqueAsync(dto.SKU, null))
            .ReturnsAsync(true);

        _productRepoMock
            .Setup(r => r.AddAsync(It.IsAny<Product>()))
            .ReturnsAsync((Product p) => p);

        _uowMock
            .Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        await _handler.Handle(
            new CreateProductCommand(dto), CancellationToken.None);

        _uowMock.Verify(
            u => u.SaveChangesAsync(),
            Times.Once);
    }
}