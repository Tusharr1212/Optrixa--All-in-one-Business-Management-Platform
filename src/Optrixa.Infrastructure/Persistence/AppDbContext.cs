// src/Optrixa.Infrastructure/Persistence/AppDbContext.cs
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Optrixa.Infrastructure.Identity;

namespace Optrixa.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<OptrixaUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Optrixa.Domain.Entities.Product> Products => Set<Optrixa.Domain.Entities.Product>();
    public DbSet<Optrixa.Domain.Entities.Category> Categories => Set<Optrixa.Domain.Entities.Category>();
    public DbSet<Optrixa.Domain.Entities.Supplier> Suppliers => Set<Optrixa.Domain.Entities.Supplier>();
    public DbSet<Optrixa.Domain.Entities.Customer> Customers => Set<Optrixa.Domain.Entities.Customer>();
    public DbSet<Optrixa.Domain.Entities.Sale> Sales => Set<Optrixa.Domain.Entities.Sale>();
    public DbSet<Optrixa.Domain.Entities.SaleItem> SaleItems => Set<Optrixa.Domain.Entities.SaleItem>();
    public DbSet<Optrixa.Domain.Entities.Expense> Expenses => Set<Optrixa.Domain.Entities.Expense>();
    public DbSet<Optrixa.Domain.Entities.StockMovement> StockMovements => Set<Optrixa.Domain.Entities.StockMovement>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Global soft delete filters
        builder.Entity<Optrixa.Domain.Entities.Product>().HasQueryFilter(x => !x.IsDeleted);
        builder.Entity<Optrixa.Domain.Entities.Category>().HasQueryFilter(x => !x.IsDeleted);
        builder.Entity<Optrixa.Domain.Entities.Supplier>().HasQueryFilter(x => !x.IsDeleted);
        builder.Entity<Optrixa.Domain.Entities.Customer>().HasQueryFilter(x => !x.IsDeleted);
        builder.Entity<Optrixa.Domain.Entities.Sale>().HasQueryFilter(x => !x.IsDeleted);
        builder.Entity<Optrixa.Domain.Entities.Expense>().HasQueryFilter(x => !x.IsDeleted);
    }
}