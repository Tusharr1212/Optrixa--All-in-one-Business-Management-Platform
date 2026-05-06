// IProductRepository.cs
namespace Optrixa.Domain.Interfaces;

using Optrixa.Domain.Entities;

public interface IProductRepository : IRepository<Product>
{
    Task<Product?> GetBySkuAsync(string sku);
    Task<IEnumerable<Product>> GetLowStockProductsAsync();
    Task<IEnumerable<Product>> GetWithCategoryAndSupplierAsync();
    Task<bool> IsSkuUniqueAsync(string sku, int? excludeId = null);
}