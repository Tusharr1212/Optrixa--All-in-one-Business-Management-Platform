// Features/Sales/Commands/CreateSaleCommandHandler.cs
using AutoMapper;
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Sales.DTOs;
using Optrixa.Domain.Entities;
using Optrixa.Domain.Enums;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Sales.Commands;

public class CreateSaleCommandHandler
    : IRequestHandler<CreateSaleCommand, ApiResponse<SaleDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CreateSaleCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ApiResponse<SaleDto>> Handle(
        CreateSaleCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        // Validate all products exist and have enough stock
        var saleItems = new List<SaleItem>();
        foreach (var item in dto.Items)
        {
            var product = await _uow.Products.GetByIdAsync(item.ProductId);
            if (product is null)
                return ApiResponse<SaleDto>.Fail($"Product {item.ProductId} not found.");

            if (product.StockQuantity < item.Quantity)
                return ApiResponse<SaleDto>.Fail(
                    $"Insufficient stock for '{product.Name}'. Available: {product.StockQuantity}");

            saleItems.Add(new SaleItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                CostPrice = product.CostPrice,  // Snapshot cost at time of sale
                LineTotal = item.Quantity * item.UnitPrice
            });
        }

        // Calculate totals
        var subTotal = saleItems.Sum(x => x.LineTotal);
        var taxAmount = subTotal * dto.TaxRate;
        var totalAmount = subTotal + taxAmount - dto.Discount;

        // Generate invoice number
        var invoiceNumber = await _uow.Sales.GenerateInvoiceNumberAsync();

        // Create the sale
        var sale = new Sale
        {
            InvoiceNumber = invoiceNumber,
            CustomerId = dto.CustomerId,
            UserId = request.UserId,
            SubTotal = subTotal,
            TaxRate = dto.TaxRate,
            TaxAmount = taxAmount,
            Discount = dto.Discount,
            TotalAmount = totalAmount,
            PaymentStatus = PaymentStatus.Pending,
            PaymentMethod = dto.PaymentMethod,
            Notes = dto.Notes,
            SaleDate = DateTime.UtcNow,
            DueDate = dto.DueDate,
            Items = saleItems
        };

        await _uow.Sales.AddAsync(sale);

        // Deduct stock and record movements
        foreach (var item in dto.Items)
        {
            var product = await _uow.Products.GetByIdAsync(item.ProductId);
            var previousStock = product!.StockQuantity;
            product.StockQuantity -= item.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
            await _uow.Products.UpdateAsync(product);

            // Record stock movement
            var movement = new StockMovement
            {
                ProductId = item.ProductId,
                UserId = request.UserId,
                MovementType = MovementType.Sale,
                Quantity = -item.Quantity,
                PreviousStock = previousStock,
                NewStock = product.StockQuantity,
                Notes = $"Sale {invoiceNumber}"
            };
            await _uow.StockMovements.AddAsync(movement);
        }

        // Update customer total purchases
        if (dto.CustomerId.HasValue)
        {
            var customer = await _uow.Customers.GetByIdAsync(dto.CustomerId.Value);
            if (customer is not null)
            {
                customer.TotalPurchases += totalAmount;
                await _uow.Customers.UpdateAsync(customer);
            }
        }

        await _uow.SaveChangesAsync();

        var saleDto = _mapper.Map<SaleDto>(sale);
        return ApiResponse<SaleDto>.Ok(saleDto, $"Sale {invoiceNumber} created successfully.");
    }
}