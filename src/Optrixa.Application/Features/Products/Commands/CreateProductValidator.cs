// Features/Products/Commands/CreateProductValidator.cs
using FluentValidation;
using Optrixa.Application.Features.Products.DTOs;

namespace Optrixa.Application.Features.Products.Commands;

public class CreateProductValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MaximumLength(200).WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.SKU)
            .NotEmpty().WithMessage("SKU is required.")
            .MaximumLength(50)
            .Matches(@"^[A-Z0-9\-]+$").WithMessage("SKU must be uppercase letters, numbers, and hyphens only.");

        RuleFor(x => x.CostPrice)
            .GreaterThan(0).WithMessage("Cost price must be greater than zero.");

        RuleFor(x => x.SellingPrice)
            .GreaterThan(0).WithMessage("Selling price must be greater than zero.")
            .GreaterThanOrEqualTo(x => x.CostPrice)
            .WithMessage("Selling price must be greater than or equal to cost price.");

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Stock quantity cannot be negative.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("A valid category is required.");
    }
}