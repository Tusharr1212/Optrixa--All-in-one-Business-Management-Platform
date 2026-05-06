using Optrixa.Domain.Common;
using Optrixa.Domain.Enums;

namespace Optrixa.Domain.Entities;

public class StockMovement : BaseEntity
{
    public int ProductId { get; set; }
    public string UserId { get; set; } = string.Empty;

    public MovementType MovementType { get; set; }
    public int Quantity { get; set; }           // Positive = in, Negative = out
    public int PreviousStock { get; set; }
    public int NewStock { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public Product Product { get; set; } = null!;
    // public OptrixaUser User { get; set; } = null!;
}