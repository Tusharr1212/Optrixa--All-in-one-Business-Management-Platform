// ProductDto.cs — what we send TO the frontend
namespace Optrixa.Application.Features.Products.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal Margin => SellingPrice > 0
        ? Math.Round((SellingPrice - CostPrice) / SellingPrice * 100, 2)
        : 0;
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; }
    public bool IsLowStock => StockQuantity <= LowStockThreshold;
    public bool IsActive { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? SupplierName { get; set; }
    public DateTime CreatedAt { get; set; }
}