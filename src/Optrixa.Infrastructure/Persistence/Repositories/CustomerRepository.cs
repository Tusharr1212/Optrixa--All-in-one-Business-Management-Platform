using Microsoft.EntityFrameworkCore;
using Optrixa.Domain.Entities;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Infrastructure.Persistence.Repositories;

public class CustomerRepository : Repository<Customer>, ICustomerRepository
{
    public CustomerRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Customer>> SearchAsync(string term) =>
        await _dbSet
            .Where(x => !x.IsDeleted &&
                (x.FullName.Contains(term) ||
                 (x.Email != null && x.Email.Contains(term)) ||
                 (x.Phone != null && x.Phone.Contains(term))))
            .OrderBy(x => x.FullName)
            .ToListAsync();
}