using Optrixa.Domain.Common;

namespace Optrixa.Domain.Entities;

public class SaleItem : BaseEntity
{
    public int SaleId { get; set; }
    public int ProductId { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }    // Selling price at time of sale
    public decimal CostPrice { get; set; }    // Cost price at time of sale (for profit calc)

    // Computed: Quantity * UnitPrice — stored for performance
    public decimal LineTotal { get; set; }

    // Navigation
    public Sale Sale { get; set; } = null!;
    public Product Product { get; set; } = null!;
}