namespace Optrixa.Application.Features.Expenses.DTOs;

public class ExpenseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string? ReceiptUrl { get; set; }
    public DateTime ExpenseDate { get; set; }
    public DateTime CreatedAt { get; set; }

    // Supplier
    public int? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public bool IsPaid { get; set; }
    public DateTime? PaidAt { get; set; }
}