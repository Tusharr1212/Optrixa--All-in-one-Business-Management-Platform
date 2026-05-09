using AutoMapper;
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Expenses.DTOs;
using Optrixa.Domain.Entities;
using Optrixa.Domain.Interfaces;

namespace Optrixa.Application.Features.Expenses.Commands;

public class CreateExpenseCommandHandler
    : IRequestHandler<CreateExpenseCommand, ApiResponse<ExpenseDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CreateExpenseCommandHandler(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<ApiResponse<ExpenseDto>> Handle(
        CreateExpenseCommand request, CancellationToken cancellationToken)
    {
        var expense = new Expense
        {
            Title = request.Dto.Title,
            Description = request.Dto.Description,
            CategoryId = request.Dto.CategoryId,
            Amount = request.Dto.Amount,
            ReceiptUrl = request.Dto.ReceiptUrl,
            ExpenseDate = request.Dto.ExpenseDate,
            UserId = request.UserId,
            SupplierId = request.Dto.SupplierId,
            IsPaid = request.Dto.IsPaid,
            PaidAt = request.Dto.IsPaid ? DateTime.UtcNow : null
        };

        await _uow.Expenses.AddAsync(expense);

        // Update supplier balance
        if (request.Dto.SupplierId.HasValue)
        {
            var supplier = await _uow.Suppliers
                .GetByIdAsync(request.Dto.SupplierId.Value);

            if (supplier is not null)
            {
                supplier.TotalPurchased += request.Dto.Amount;
                if (request.Dto.IsPaid)
                    supplier.TotalPaid += request.Dto.Amount;
                supplier.UpdatedAt = DateTime.UtcNow;
                await _uow.Suppliers.UpdateAsync(supplier);
            }
        }

        await _uow.SaveChangesAsync();

        var dto = _mapper.Map<ExpenseDto>(expense);
        return ApiResponse<ExpenseDto>.Ok(dto, "Expense created successfully.");
    }
}