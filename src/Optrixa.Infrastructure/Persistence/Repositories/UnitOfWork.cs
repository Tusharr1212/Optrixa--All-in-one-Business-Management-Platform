using Microsoft.EntityFrameworkCore.Storage;
using Optrixa.Domain.Entities;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IDbContextTransaction? _transaction;

    public IProductRepository Products { get; }
    public ISaleRepository Sales { get; }
    public IExpenseRepository Expenses { get; }
    public ISupplierRepository Suppliers { get; }
    public IRepository<StockMovement> StockMovements { get; }
    public IRepository<Customer> Customers { get; }

    public UnitOfWork(
        AppDbContext context,
        IProductRepository products,
        ISaleRepository sales,
        IExpenseRepository expenses,
        ISupplierRepository suppliers,
        IRepository<StockMovement> stockMovements,
        IRepository<Customer> customers)
    {
        _context = context;
        Products = products;
        Sales = sales;
        Expenses = expenses;
        Suppliers = suppliers;
        StockMovements = stockMovements;
        Customers = customers;
    }

    public async Task<int> SaveChangesAsync() =>
        await _context.SaveChangesAsync();

    public async Task BeginTransactionAsync() =>
        _transaction = await _context.Database.BeginTransactionAsync();

    public async Task CommitTransactionAsync()
    {
        await _transaction!.CommitAsync();
        _transaction.Dispose();
    }

    public async Task RollbackTransactionAsync()
    {
        await _transaction!.RollbackAsync();
        _transaction.Dispose();
    }

    public void Dispose() => _context.Dispose();
}