using Moq;
using Optrixa.Application.Features.Sales.Commands;
using Optrixa.Application.Features.Sales.DTOs;
using Optrixa.Domain.Entities;
using Optrixa.Domain.Interfaces;
using Xunit;

namespace Optrixa.Tests.Sales;

public class CreateSaleCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly Mock<IProductRepository> _productRepoMock;
    private readonly Mock<ISaleRepository> _saleRepoMock;
    private readonly Mock<IRepository<StockMovement>> _stockRepoMock;
    private readonly Mock<IRepository<Customer>> _customerRepoMock;
    private readonly CreateSaleCommandHandler _handler;

    public CreateSaleCommandHandlerTests()
    {
        _uowMock = new Mock<IUnitOfWork>();
        _productRepoMock = new Mock<IProductRepository>();
        _saleRepoMock = new Mock<ISaleRepository>();
        _stockRepoMock = new Mock<IRepository<StockMovement>>();
        _customerRepoMock = new Mock<IRepository<Customer>>();

        _uowMock.Setup(u => u.Products).Returns(_productRepoMock.Object);
        _uowMock.Setup(u => u.Sales).Returns(_saleRepoMock.Object);
        _uowMock.Setup(u => u.StockMovements).Returns(_stockRepoMock.Object);
        _uowMock.Setup(u => u.Customers).Returns(_customerRepoMock.Object);

        var mapperConfig = new AutoMapper.MapperConfiguration(cfg =>
            cfg.AddProfile<Optrixa.Application.Mappings.MappingProfile>());
        var mapper = mapperConfig.CreateMapper();

        _handler = new CreateSaleCommandHandler(_uowMock.Object, mapper);
    }

    [Fact]
    public async Task Handle_ValidSale_ReturnsSuccess()
    {
        var product = new Product
        {
            Id = 1,
            Name = "Samsung TV",
            SKU = "ELEC-TV-001",
            CostPrice = 400m,
            SellingPrice = 599.99m,
            StockQuantity = 25
        };

        var dto = new CreateSaleDto
        {
            TaxRate = 0,
            Discount = 0,
            PaymentMethod = "Cash",
            Items = new List<CreateSaleItemDto>
            {
                new() { ProductId = 1, Quantity = 2, UnitPrice = 599.99m }
            }
        };

        _productRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(product);
        _saleRepoMock.Setup(r => r.GenerateInvoiceNumberAsync()).ReturnsAsync("INV-2026-00001");
        _saleRepoMock.Setup(r => r.AddAsync(It.IsAny<Sale>())).ReturnsAsync((Sale s) => s);
        _stockRepoMock.Setup(r => r.AddAsync(It.IsAny<StockMovement>())).ReturnsAsync((StockMovement m) => m);
        _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        var result = await _handler.Handle(
            new CreateSaleCommand(dto, "user-123"),
            CancellationToken.None);

        Assert.True(result.Success);
        Assert.Equal("INV-2026-00001", result.Data!.InvoiceNumber);
        Assert.Equal(1199.98m, result.Data.TotalAmount);
    }

    [Fact]
    public async Task Handle_InsufficientStock_ReturnsFailure()
    {
        var product = new Product
        {
            Id = 1,
            Name = "Samsung TV",
            SKU = "ELEC-TV-001",
            CostPrice = 400m,
            SellingPrice = 599.99m,
            StockQuantity = 1
        };

        var dto = new CreateSaleDto
        {
            Items = new List<CreateSaleItemDto>
            {
                new() { ProductId = 1, Quantity = 5, UnitPrice = 599.99m }
            }
        };

        _productRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(product);

        var result = await _handler.Handle(
            new CreateSaleCommand(dto, "user-123"),
            CancellationToken.None);

        Assert.False(result.Success);
        Assert.Contains("Insufficient stock", result.Message);

        _saleRepoMock.Verify(
            r => r.AddAsync(It.IsAny<Sale>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_ValidSale_DecrementsStock()
    {
        var product = new Product
        {
            Id = 1,
            Name = "Samsung TV",
            SKU = "ELEC-TV-001",
            CostPrice = 400m,
            SellingPrice = 599.99m,
            StockQuantity = 25
        };

        var dto = new CreateSaleDto
        {
            Items = new List<CreateSaleItemDto>
            {
                new() { ProductId = 1, Quantity = 3, UnitPrice = 599.99m }
            }
        };

        _productRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(product);
        _saleRepoMock.Setup(r => r.GenerateInvoiceNumberAsync()).ReturnsAsync("INV-2026-00002");
        _saleRepoMock.Setup(r => r.AddAsync(It.IsAny<Sale>())).ReturnsAsync((Sale s) => s);
        _stockRepoMock.Setup(r => r.AddAsync(It.IsAny<StockMovement>())).ReturnsAsync((StockMovement m) => m);
        _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        await _handler.Handle(
            new CreateSaleCommand(dto, "user-123"),
            CancellationToken.None);

        // 25 - 3 = 22
        Assert.Equal(22, product.StockQuantity);
    }

    [Fact]
    public async Task Handle_ProductNotFound_ReturnsFailure()
    {
        var dto = new CreateSaleDto
        {
            Items = new List<CreateSaleItemDto>
            {
                new() { ProductId = 999, Quantity = 1, UnitPrice = 100m }
            }
        };

        _productRepoMock
            .Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Product?)null);

        var result = await _handler.Handle(
            new CreateSaleCommand(dto, "user-123"),
            CancellationToken.None);

        Assert.False(result.Success);
        Assert.Contains("not found", result.Message);
    }
}