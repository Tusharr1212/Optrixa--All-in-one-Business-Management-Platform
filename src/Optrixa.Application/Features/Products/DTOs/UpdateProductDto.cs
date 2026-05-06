// UpdateProductDto.cs
namespace Optrixa.Application.Features.Products.DTOs;

public class UpdateProductDto : CreateProductDto
{
    public int Id { get; set; }
    public bool IsActive { get; set; } = true;
}