using Optrixa.Domain.Common;
using Optrixa.Domain.Enums;

namespace Optrixa.Domain.Entities;

public class Sale : BaseEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;  // e.g. "INV-2024-00042"

    public int? CustomerId { get; set; }
    public string UserId { get; set; } = string.Empty;   // Who created this sale

    public decimal SubTotal { get; set; }
    public decimal TaxRate { get; set; } = 0;            // e.g. 0.16 for 16%
    public decimal TaxAmount { get; set; }
    public decimal Discount { get; set; } = 0;
    public decimal TotalAmount { get; set; }

    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public string? PaymentMethod { get; set; }           // Cash, Card, Transfer
    public string? Notes { get; set; }

    public DateTime SaleDate { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }

    // Navigation
    public Customer? Customer { get; set; }
    // public OptrixaUser User { get; set; } = null!;
    public ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
}