// Features/Sales/DTOs/SaleItemDto.cs
namespace Optrixa.Application.Features.Sales.DTOs;

public class SaleItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal CostPrice { get; set; }
    public decimal LineTotal { get; set; }
}