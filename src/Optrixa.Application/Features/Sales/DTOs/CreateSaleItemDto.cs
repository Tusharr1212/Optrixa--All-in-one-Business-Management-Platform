// Features/Sales/DTOs/CreateSaleItemDto.cs
namespace Optrixa.Application.Features.Sales.DTOs;

public class CreateSaleItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}