using Microsoft.EntityFrameworkCore;
using Optrixa.Domain.Entities;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Infrastructure.Persistence.Repositories;

public class ExpenseRepository : Repository<Expense>, IExpenseRepository
{
    public ExpenseRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Expense>> GetByDateRangeAsync(DateTime from, DateTime to) =>
        await _dbSet
            .Where(x => x.ExpenseDate >= from && x.ExpenseDate <= to)
            .Include(x => x.Category)
            .OrderByDescending(x => x.ExpenseDate)
            .ToListAsync();

    public async Task<decimal> GetTotalExpensesAsync(DateTime from, DateTime to) =>
        await _dbSet
            .Where(x => x.ExpenseDate >= from && x.ExpenseDate <= to)
            .SumAsync(x => x.Amount);

    public async Task<IEnumerable<object>> GetMonthlySummaryAsync(int year) =>
        await _dbSet
            .Where(x => x.ExpenseDate.Year == year)
            .GroupBy(x => x.ExpenseDate.Month)
            .Select(g => new
            {
                Month = g.Key,
                Total = g.Sum(x => x.Amount),
                Count = g.Count()
            })
            .Cast<object>()
            .ToListAsync();
}