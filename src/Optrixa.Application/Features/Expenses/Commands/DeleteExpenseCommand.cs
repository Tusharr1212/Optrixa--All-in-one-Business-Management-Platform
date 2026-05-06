// Features/Expenses/Commands/DeleteExpenseCommand.cs
using MediatR;
using Optrixa.Application.Common;

namespace Optrixa.Application.Features.Expenses.Commands;

public record DeleteExpenseCommand(int Id) : IRequest<ApiResponse<bool>>;