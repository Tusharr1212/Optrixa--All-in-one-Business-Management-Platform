// Features/Products/Queries/GetProductsQuery.cs
using MediatR;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Products.DTOs;

namespace Optrixa.Application.Features.Products.Queries;

public record GetProductsQuery(PaginationParams Params) 
    : IRequest<ApiResponse<PaginatedResult<ProductDto>>>;