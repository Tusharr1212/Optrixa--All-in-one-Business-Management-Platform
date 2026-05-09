using Optrixa.Domain.Common;

namespace Optrixa.Domain.Entities;

public class Expense : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    public int CategoryId { get; set; }
    public string UserId { get; set; } = string.Empty;

    public decimal Amount { get; set; }
    public string? ReceiptUrl { get; set; }
    public DateTime ExpenseDate { get; set; }

    // Supplier tracking
    public int? SupplierId { get; set; }
    public bool IsPaid { get; set; } = true;  // Default true for non-supplier expenses
    public DateTime? PaidAt { get; set; }

    // Navigation
    public Category Category { get; set; } = null!;
    public Supplier? Supplier { get; set; }
}