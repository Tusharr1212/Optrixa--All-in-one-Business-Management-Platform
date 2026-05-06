using Optrixa.Domain.Common;

namespace Optrixa.Domain.Entities;

public class Expense : BaseEntity
{
    public string Title { get; set; } = string.Empty;       // e.g. "Office Rent - March"
    public string? Description { get; set; }

    public int CategoryId { get; set; }
    public string UserId { get; set; } = string.Empty;

    public decimal Amount { get; set; }
    public string? ReceiptUrl { get; set; }
    public DateTime ExpenseDate { get; set; }

    // Navigation
    public Category Category { get; set; } = null!;
    // public OptrixaUser User { get; set; } = null!;
}