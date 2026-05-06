// Features/Products/Commands/CreateProductCommand.cs
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Products.DTOs;

namespace Optrixa.Application.Features.Products.Commands;

// The command carries the data. The handler does the work.
public record CreateProductCommand(CreateProductDto Dto) : IRequest<ApiResponse<ProductDto>>;