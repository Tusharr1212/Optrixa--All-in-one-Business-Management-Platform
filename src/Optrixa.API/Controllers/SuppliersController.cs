using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Optrixa.Application.Common;
using Optrixa.Domain.Entities;
using Optrixa.Domain.Interfaces;

namespace Optrixa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SuppliersController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public SuppliersController(IUnitOfWork uow) => _uow = uow;

    [HttpGet]
    public async Task<IActionResult> GetSuppliers()
    {
        var suppliers = await _uow.Suppliers.GetWithExpensesAsync();
        return Ok(ApiResponse<IEnumerable<Supplier>>.Ok(suppliers));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSupplier(int id)
    {
        var supplier = await _uow.Suppliers.GetWithExpensesByIdAsync(id);
        if (supplier is null)
            return NotFound(ApiResponse<Supplier>.Fail("Supplier not found."));
        return Ok(ApiResponse<Supplier>.Ok(supplier));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateSupplier([FromBody] Supplier supplier)
    {
        await _uow.Suppliers.AddAsync(supplier);
        await _uow.SaveChangesAsync();
        return Ok(ApiResponse<Supplier>.Ok(supplier, "Supplier created."));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSupplier(
        int id, [FromBody] Supplier supplier)
    {
        if (id != supplier.Id) return BadRequest("ID mismatch.");
        supplier.UpdatedAt = DateTime.UtcNow;
        await _uow.Suppliers.UpdateAsync(supplier);
        await _uow.SaveChangesAsync();
        return Ok(ApiResponse<Supplier>.Ok(supplier, "Supplier updated."));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        var supplier = await _uow.Suppliers.GetByIdAsync(id);
        if (supplier is null)
            return NotFound(ApiResponse<bool>.Fail("Supplier not found."));

        supplier.IsDeleted = true;
        supplier.UpdatedAt = DateTime.UtcNow;
        await _uow.Suppliers.UpdateAsync(supplier);
        await _uow.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Supplier deleted."));
    }

    // Record a payment to a supplier
    [HttpPost("{id:int}/pay")]
    public async Task<IActionResult> RecordPayment(
        int id, [FromBody] RecordPaymentDto dto)
    {
        var supplier = await _uow.Suppliers.GetByIdAsync(id);
        if (supplier is null)
            return NotFound(ApiResponse<bool>.Fail("Supplier not found."));

        if (dto.Amount <= 0)
            return BadRequest(ApiResponse<bool>.Fail(
                "Payment amount must be greater than zero."));

        if (dto.Amount > supplier.OutstandingBalance)
            return BadRequest(ApiResponse<bool>.Fail(
                $"Payment amount exceeds outstanding balance of {supplier.OutstandingBalance:C}."));

        supplier.TotalPaid += dto.Amount;
        supplier.UpdatedAt = DateTime.UtcNow;
        await _uow.Suppliers.UpdateAsync(supplier);

        // Also mark related unpaid expenses as paid (oldest first)
        var unpaidExpenses = supplier.Expenses?
            .Where(e => !e.IsPaid && !e.IsDeleted)
            .OrderBy(e => e.ExpenseDate)
            .ToList() ?? new();

        var remaining = dto.Amount;
        foreach (var expense in unpaidExpenses)
        {
            if (remaining <= 0) break;
            if (expense.Amount <= remaining)
            {
                expense.IsPaid = true;
                expense.PaidAt = DateTime.UtcNow;
                remaining -= expense.Amount;
            }
        }

        await _uow.SaveChangesAsync();

        return Ok(ApiResponse<bool>.Ok(true,
            $"Payment of {dto.Amount:C} recorded successfully."));
    }
}

public class RecordPaymentDto
{
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
}