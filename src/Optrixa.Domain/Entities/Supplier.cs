using Optrixa.Domain.Common;

namespace Optrixa.Domain.Entities;

public class Supplier : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? ContactName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }

    // Balance tracking
    public decimal TotalPurchased { get; set; } = 0;   // Total ever bought
    public decimal TotalPaid { get; set; } = 0;         // Total ever paid
    public decimal OutstandingBalance => TotalPurchased - TotalPaid;

    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}