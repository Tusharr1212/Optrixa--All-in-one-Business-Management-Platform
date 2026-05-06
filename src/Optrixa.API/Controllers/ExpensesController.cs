using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Expenses.Commands;
using Optrixa.Application.Features.Expenses.DTOs;
using Optrixa.Application.Features.Expenses.Queries;
using System.Security.Claims;

namespace Optrixa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ExpensesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetExpenses([FromQuery] PaginationParams paginationParams)
    {
        var result = await _mediator.Send(new GetExpensesQuery(paginationParams));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateExpense([FromBody] CreateExpenseDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _mediator.Send(new CreateExpenseCommand(dto, userId));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateExpense(int id, [FromBody] UpdateExpenseDto dto)
    {
        if (id != dto.Id) return BadRequest("ID mismatch.");
        var result = await _mediator.Send(new UpdateExpenseCommand(dto));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        var result = await _mediator.Send(new DeleteExpenseCommand(id));
        return result.Success ? Ok(result) : NotFound(result);
    }
}