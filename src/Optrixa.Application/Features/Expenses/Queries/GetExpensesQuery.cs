// Features/Expenses/Queries/GetExpensesQuery.cs
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Expenses.DTOs;

namespace Optrixa.Application.Features.Expenses.Queries;

public record GetExpensesQuery(PaginationParams Params)
    : IRequest<ApiResponse<PaginatedResult<ExpenseDto>>>;