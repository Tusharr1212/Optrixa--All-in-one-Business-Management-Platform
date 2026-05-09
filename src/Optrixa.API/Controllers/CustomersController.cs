using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Optrixa.Application.Common;
using Optrixa.Domain.Entities;
using Optrixa.Infrastructure.Persistence;

namespace Optrixa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetCustomers([FromQuery] string? search)
    {
        var query = _context.Customers.Where(x => !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(x =>
                x.FullName.Contains(search) ||
                (x.Email != null && x.Email.Contains(search)) ||
                (x.Phone != null && x.Phone.Contains(search)));

        var customers = await query
            .OrderByDescending(x => x.TotalPurchases)
            .ToListAsync();

        return Ok(ApiResponse<List<Customer>>.Ok(customers));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCustomer(int id)
    {
        var customer = await _context.Customers
            .Include(x => x.Sales)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (customer is null)
            return NotFound(ApiResponse<Customer>.Fail("Customer not found."));

        return Ok(ApiResponse<Customer>.Ok(customer));
    }

    [HttpPost]
    public async Task<IActionResult> CreateCustomer([FromBody] Customer customer)
    {
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Customer>.Ok(customer, "Customer created."));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCustomer(
        int id, [FromBody] Customer customer)
    {
        if (id != customer.Id) return BadRequest("ID mismatch.");
        customer.UpdatedAt = DateTime.UtcNow;
        _context.Customers.Update(customer);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Customer>.Ok(customer, "Customer updated."));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCustomer(int id)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer is null)
            return NotFound(ApiResponse<bool>.Fail("Customer not found."));

        customer.IsDeleted = true;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Customer deleted."));
    }
}