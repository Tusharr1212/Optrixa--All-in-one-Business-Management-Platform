// Features/Expenses/Commands/UpdateExpenseCommand.cs
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Expenses.DTOs;

namespace Optrixa.Application.Features.Expenses.Commands;

public record UpdateExpenseCommand(UpdateExpenseDto Dto) : IRequest<ApiResponse<ExpenseDto>>;