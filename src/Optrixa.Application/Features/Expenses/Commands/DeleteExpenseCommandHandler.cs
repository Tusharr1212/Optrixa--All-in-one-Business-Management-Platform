// Features/Expenses/Commands/DeleteExpenseCommandHandler.cs
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Expenses.Commands;

public class DeleteExpenseCommandHandler
    : IRequestHandler<DeleteExpenseCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _uow;

    public DeleteExpenseCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<ApiResponse<bool>> Handle(
        DeleteExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = await _uow.Expenses.GetByIdAsync(request.Id);
        if (expense is null)
            return ApiResponse<bool>.Fail("Expense not found.");

        expense.IsDeleted = true;
        expense.UpdatedAt = DateTime.UtcNow;
        await _uow.Expenses.UpdateAsync(expense);
        await _uow.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Expense deleted.");
    }
}