// Features/Expenses/Commands/CreateExpenseCommand.cs
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Expenses.DTOs;

namespace Optrixa.Application.Features.Expenses.Commands;

public record CreateExpenseCommand(CreateExpenseDto Dto, string UserId)
    : IRequest<ApiResponse<ExpenseDto>>;
