// ISaleRepository.cs
namespace Optrixa.Domain.Interfaces;

using Optrixa.Domain.Entities;

public interface ISaleRepository : IRepository<Sale>
{
    Task<Sale?> GetWithItemsAsync(int id);
    Task<IEnumerable<Sale>> GetByDateRangeAsync(DateTime from, DateTime to);
    Task<decimal> GetTotalRevenueAsync(DateTime from, DateTime to);
    Task<string> GenerateInvoiceNumberAsync();
}
