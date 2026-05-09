using Optrixa.Domain.Entities;

namespace Optrixa.Domain.Interfaces;

public interface ISupplierRepository : IRepository<Supplier>
{
    Task<IEnumerable<Supplier>> GetWithExpensesAsync();
    Task<Supplier?> GetWithExpensesByIdAsync(int id);
}