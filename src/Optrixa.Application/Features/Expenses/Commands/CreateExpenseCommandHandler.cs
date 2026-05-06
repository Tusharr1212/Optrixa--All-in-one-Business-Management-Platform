// Features/Expenses/Commands/CreateExpenseCommandHandler.cs
using AutoMapper;
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Expenses.DTOs;
using Optrixa.Domain.Entities;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Expenses.Commands;

public class CreateExpenseCommandHandler
    : IRequestHandler<CreateExpenseCommand, ApiResponse<ExpenseDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CreateExpenseCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ApiResponse<ExpenseDto>> Handle(
        CreateExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = new Expense
        {
            Title = request.Dto.Title,
            Description = request.Dto.Description,
            CategoryId = request.Dto.CategoryId,
            Amount = request.Dto.Amount,
            ReceiptUrl = request.Dto.ReceiptUrl,
            ExpenseDate = request.Dto.ExpenseDate,
            UserId = request.UserId
        };

        await _uow.Expenses.AddAsync(expense);
        await _uow.SaveChangesAsync();

        var dto = _mapper.Map<ExpenseDto>(expense);
        return ApiResponse<ExpenseDto>.Ok(dto, "Expense created successfully.");
    }
}