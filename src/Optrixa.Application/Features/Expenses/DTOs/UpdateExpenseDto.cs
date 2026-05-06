// Features/Expenses/DTOs/UpdateExpenseDto.cs
namespace Optrixa.Application.Features.Expenses.DTOs;

public class UpdateExpenseDto : CreateExpenseDto
{
    public int Id { get; set; }
}