// Features/Expenses/Commands/UpdateExpenseCommandHandler.cs
using AutoMapper;
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Expenses.DTOs;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Expenses.Commands;

public class UpdateExpenseCommandHandler
    : IRequestHandler<UpdateExpenseCommand, ApiResponse<ExpenseDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public UpdateExpenseCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ApiResponse<ExpenseDto>> Handle(
        UpdateExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = await _uow.Expenses.GetByIdAsync(request.Dto.Id);
        if (expense is null)
            return ApiResponse<ExpenseDto>.Fail("Expense not found.");

        expense.Title = request.Dto.Title;
        expense.Description = request.Dto.Description;
        expense.CategoryId = request.Dto.CategoryId;
        expense.Amount = request.Dto.Amount;
        expense.ReceiptUrl = request.Dto.ReceiptUrl;
        expense.ExpenseDate = request.Dto.ExpenseDate;
        expense.UpdatedAt = DateTime.UtcNow;

        await _uow.Expenses.UpdateAsync(expense);
        await _uow.SaveChangesAsync();

        return ApiResponse<ExpenseDto>.Ok(_mapper.Map<ExpenseDto>(expense), "Expense updated.");
    }
}