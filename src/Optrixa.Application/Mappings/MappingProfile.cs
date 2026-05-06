using AutoMapper;
using Optrixa.Application.Features.Expenses.DTOs;
using Optrixa.Application.Features.Products.DTOs;
using Optrixa.Application.Features.Sales.DTOs;
using Optrixa.Domain.Entities;

namespace Optrixa.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Product
        CreateMap<Product, ProductDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : string.Empty))
            .ForMember(d => d.SupplierName, o => o.MapFrom(s => s.Supplier != null ? s.Supplier.Name : null));
        CreateMap<CreateProductDto, Product>();
        CreateMap<UpdateProductDto, Product>()
            .ForMember(d => d.Id, o => o.Ignore());

        // Expense
        CreateMap<Expense, ExpenseDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : string.Empty));
        CreateMap<CreateExpenseDto, Expense>();

        // Sale
        CreateMap<Sale, SaleDto>()
            .ForMember(d => d.CustomerName, o => o.MapFrom(s => s.Customer != null ? s.Customer.FullName : null))
            .ForMember(d => d.PaymentStatus, o => o.MapFrom(s => s.PaymentStatus.ToString()));
        CreateMap<SaleItem, SaleItemDto>()
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product != null ? s.Product.Name : string.Empty));
    }
}