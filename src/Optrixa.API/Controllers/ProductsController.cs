using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Products.Commands;
using Optrixa.Application.Features.Products.DTOs;
using Optrixa.Application.Features.Products.Queries;
using Optrixa.Domain.Enums;
using Optrixa.Application.Features.Products.Queries;

namespace Optrixa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]  // All endpoints require a valid JWT by default
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] PaginationParams paginationParams)
    {
        var result = await _mediator.Send(new GetProductsQuery(paginationParams));
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var result = await _mediator.Send(new GetProductByIdQuery(id));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]  // Only admins can create products
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
    {
        var result = await _mediator.Send(new CreateProductCommand(dto));
        return result.Success
            ? CreatedAtAction(nameof(GetProduct), new { id = result.Data!.Id }, result)
            : BadRequest(result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
    {
        if (id != dto.Id) return BadRequest("Route ID and body ID mismatch.");
        var result = await _mediator.Send(new UpdateProductCommand(dto));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var result = await _mediator.Send(new DeleteProductCommand(id));
        return result.Success ? Ok(result) : NotFound(result);
    }
}