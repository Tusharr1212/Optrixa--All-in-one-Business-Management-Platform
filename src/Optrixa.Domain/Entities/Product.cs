using Optrixa.Domain.Common;

namespace Optrixa.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;       // e.g. "ELEC-TV-001"
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }

    // Foreign keys
    public int CategoryId { get; set; }
    public int? SupplierId { get; set; }

    public decimal CostPrice { get; set; }         // What you pay the supplier
    public decimal SellingPrice { get; set; }      // What you charge the customer

    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; } = 10;  // Alert fires below this

    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Category Category { get; set; } = null!;
    public Supplier? Supplier { get; set; }
    public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}