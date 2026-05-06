using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Products.DTOs;

namespace Optrixa.Application.Features.Products.Queries;

public record GetProductByIdQuery(int Id) : IRequest<ApiResponse<ProductDto>>;