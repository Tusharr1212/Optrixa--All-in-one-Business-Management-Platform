// Persistence/Repositories/ProductRepository.cs
using Microsoft.EntityFrameworkCore;
using Optrixa.Domain.Entities;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Infrastructure.Persistence.Repositories;

public class ProductRepository : Repository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context) : base(context) { }

    public async Task<Product?> GetBySkuAsync(string sku) =>
        await _dbSet.FirstOrDefaultAsync(x => x.SKU == sku);

    public async Task<IEnumerable<Product>> GetLowStockProductsAsync() =>
        await _dbSet
            .Include(x => x.Category)
            .Where(x => x.StockQuantity <= x.LowStockThreshold && x.IsActive)
            .OrderBy(x => x.StockQuantity)
            .ToListAsync();

    public async Task<IEnumerable<Product>> GetWithCategoryAndSupplierAsync() =>
        await _dbSet
            .Include(x => x.Category)
            .Include(x => x.Supplier)
            .Where(x => x.IsActive)
            .ToListAsync();

    public async Task<bool> IsSkuUniqueAsync(string sku, int? excludeId = null)
    {
        var query = _dbSet.Where(x => x.SKU == sku);
        if (excludeId.HasValue)
            query = query.Where(x => x.Id != excludeId.Value);
        return !await query.AnyAsync();
    }

    public async Task<Product?> GetWithCategoryAndSupplierByIdAsync(int id) =>
    await _dbSet
        .Include(x => x.Category)
        .Include(x => x.Supplier)
        .FirstOrDefaultAsync(x => x.Id == id);
}