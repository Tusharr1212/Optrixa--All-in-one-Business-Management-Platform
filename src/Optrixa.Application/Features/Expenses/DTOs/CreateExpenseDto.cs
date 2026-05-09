namespace Optrixa.Application.Features.Expenses.DTOs;

public class CreateExpenseDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public decimal Amount { get; set; }
    public string? ReceiptUrl { get; set; }
    public DateTime ExpenseDate { get; set; }

    // Supplier
    public int? SupplierId { get; set; }
    public bool IsPaid { get; set; } = true;
}