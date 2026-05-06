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
public class SuppliersController : ControllerBase
{
    private readonly AppDbContext _context;

    public SuppliersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetSuppliers()
    {
        var suppliers = await _context.Suppliers
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.Name)
            .ToListAsync();
        return Ok(ApiResponse<List<Supplier>>.Ok(suppliers));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateSupplier([FromBody] Supplier supplier)
    {
        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Supplier>.Ok(supplier, "Supplier created."));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSupplier(int id, [FromBody] Supplier supplier)
    {
        if (id != supplier.Id) return BadRequest("ID mismatch.");
        supplier.UpdatedAt = DateTime.UtcNow;
        _context.Suppliers.Update(supplier);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Supplier>.Ok(supplier, "Supplier updated."));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier is null)
            return NotFound(ApiResponse<bool>.Fail("Supplier not found."));

        supplier.IsDeleted = true;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Supplier deleted."));
    }
}