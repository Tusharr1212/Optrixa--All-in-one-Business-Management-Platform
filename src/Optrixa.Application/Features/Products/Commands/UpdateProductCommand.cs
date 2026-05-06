// Features/Products/Commands/UpdateProductCommand.cs
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Products.DTOs;

namespace Optrixa.Application.Features.Products.Commands;

public record UpdateProductCommand(UpdateProductDto Dto) : IRequest<ApiResponse<ProductDto>>;