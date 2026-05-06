// Features/Products/Commands/DeleteProductCommand.cs
using MediatR;
using Optrixa.Application.Common;

namespace Optrixa.Application.Features.Products.Commands;

public record DeleteProductCommand(int Id) : IRequest<ApiResponse<bool>>;