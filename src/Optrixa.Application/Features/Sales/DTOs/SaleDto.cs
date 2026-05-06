// Features/Sales/DTOs/SaleDto.cs
using Optrixa.Domain.Enums;

namespace Optrixa.Application.Features.Sales.DTOs;

public class SaleDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public int? CustomerId { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? Notes { get; set; }
    public DateTime SaleDate { get; set; }
    public DateTime? DueDate { get; set; }
    public List<SaleItemDto> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}