// Features/Expenses/Queries/GetExpensesQueryHandler.cs
using AutoMapper;
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Expenses.DTOs;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Expenses.Queries;

public class GetExpensesQueryHandler
    : IRequestHandler<GetExpensesQuery, ApiResponse<PaginatedResult<ExpenseDto>>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetExpensesQueryHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ApiResponse<PaginatedResult<ExpenseDto>>> Handle(
        GetExpensesQuery request, CancellationToken cancellationToken)
    {
        var p = request.Params;
        var expenses = await _uow.Expenses.GetByDateRangeAsync(
            p.FromDate ?? DateTime.UtcNow.AddYears(-1),
            p.ToDate ?? DateTime.UtcNow);

        if (!string.IsNullOrWhiteSpace(p.SearchTerm))
        {
            var term = p.SearchTerm.ToLower();
            expenses = expenses.Where(x =>
                x.Title.ToLower().Contains(term) ||
                (x.Category.Name.ToLower().Contains(term)));
        }

        var totalCount = expenses.Count();
        var items = expenses
            .Skip((p.Page - 1) * p.PageSize)
            .Take(p.PageSize)
            .Select(x => _mapper.Map<ExpenseDto>(x));

        return ApiResponse<PaginatedResult<ExpenseDto>>.Ok(new PaginatedResult<ExpenseDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = p.Page,
            PageSize = p.PageSize
        });
    }
}