// IExpenseRepository.cs
namespace Optrixa.Domain.Interfaces;

using Optrixa.Domain.Entities;

public interface IExpenseRepository : IRepository<Expense>
{
    Task<IEnumerable<Expense>> GetByDateRangeAsync(DateTime from, DateTime to);
    Task<decimal> GetTotalExpensesAsync(DateTime from, DateTime to);
    Task<IEnumerable<object>> GetMonthlySummaryAsync(int year);
}