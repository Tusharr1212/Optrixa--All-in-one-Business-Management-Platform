using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Sales.Commands;
using Optrixa.Application.Features.Sales.DTOs;
using Optrixa.Application.Features.Sales.Queries;
using System.Security.Claims;

namespace Optrixa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SalesController : ControllerBase
{
    private readonly IMediator _mediator;

    public SalesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetSales([FromQuery] PaginationParams paginationParams)
    {
        var result = await _mediator.Send(new GetSalesQuery(paginationParams));
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSale(int id)
    {
        var result = await _mediator.Send(new GetSaleByIdQuery(id));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSale([FromBody] CreateSaleDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _mediator.Send(new CreateSaleCommand(dto, userId));
        return result.Success
            ? CreatedAtAction(nameof(GetSale), new { id = result.Data!.Id }, result)
            : BadRequest(result);
    }

    [HttpPatch("{id:int}/status")]
public async Task<IActionResult> UpdatePaymentStatus(
    int id, [FromBody] UpdatePaymentStatusDto dto)
{
    var result = await _mediator.Send(
        new UpdateSaleStatusCommand(id, dto.PaymentStatus));
    return result.Success ? Ok(result) : BadRequest(result);
}
}