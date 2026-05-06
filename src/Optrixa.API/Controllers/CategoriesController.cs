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
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetCategories([FromQuery] string? type)
    {
        var query = _context.Categories.Where(x => !x.IsDeleted);
        if (!string.IsNullOrEmpty(type))
            query = query.Where(x => x.Type == type);

        var categories = await query.OrderBy(x => x.Name).ToListAsync();
        return Ok(ApiResponse<List<Category>>.Ok(categories));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateCategory([FromBody] Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<Category>.Ok(category, "Category created."));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category is null)
            return NotFound(ApiResponse<bool>.Fail("Category not found."));

        category.IsDeleted = true;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Category deleted."));
    }
}