using Optrixa.Domain.Common;

namespace Optrixa.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // "Product" or "Expense" — one table serves both module types
    public string Type { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}