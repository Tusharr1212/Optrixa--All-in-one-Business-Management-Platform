using Microsoft.EntityFrameworkCore;
using Optrixa.Domain.Entities;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Infrastructure.Persistence.Repositories;

public class SupplierRepository : Repository<Supplier>, ISupplierRepository
{
    public SupplierRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Supplier>> GetWithExpensesAsync() =>
        await _dbSet
            .Include(x => x.Expenses.Where(e => !e.IsDeleted))
                .ThenInclude(e => e.Category)
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.Name)
            .ToListAsync();

    public async Task<Supplier?> GetWithExpensesByIdAsync(int id) =>
        await _dbSet
            .Include(x => x.Expenses.Where(e => !e.IsDeleted))
                .ThenInclude(e => e.Category)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
}