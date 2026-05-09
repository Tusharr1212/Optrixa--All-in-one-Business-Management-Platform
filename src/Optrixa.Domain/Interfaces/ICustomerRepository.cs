namespace Optrixa.Domain.Interfaces;

using Optrixa.Domain.Entities;

public interface ICustomerRepository : IRepository<Customer>
{
    Task<IEnumerable<Customer>> SearchAsync(string term);
}