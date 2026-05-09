namespace Optrixa.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IProductRepository Products { get; }
    ISaleRepository Sales { get; }
    IExpenseRepository Expenses { get; }
    ISupplierRepository Suppliers { get; }
    IRepository<Domain.Entities.StockMovement> StockMovements { get; }
    IRepository<Domain.Entities.Customer> Customers { get; }
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}