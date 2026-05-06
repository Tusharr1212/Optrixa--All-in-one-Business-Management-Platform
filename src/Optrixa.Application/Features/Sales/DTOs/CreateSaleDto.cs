// Features/Sales/DTOs/CreateSaleDto.cs
namespace Optrixa.Application.Features.Sales.DTOs;

public class CreateSaleDto
{
    public int? CustomerId { get; set; }
    public decimal TaxRate { get; set; } = 0;
    public decimal Discount { get; set; } = 0;
    public string? PaymentMethod { get; set; }
    public string? Notes { get; set; }
    public DateTime? DueDate { get; set; }
    public List<CreateSaleItemDto> Items { get; set; } = new();
}