using Moq;
using Optrixa.Application.Features.Expenses.Commands;
using Optrixa.Application.Features.Expenses.DTOs;
using Optrixa.Domain.Entities;
using Optrixa.Domain.Interfaces;
using Xunit;

namespace Optrixa.Tests.Expenses;

public class CreateExpenseCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly Mock<IExpenseRepository> _expenseRepoMock;
    private readonly CreateExpenseCommandHandler _handler;

    public CreateExpenseCommandHandlerTests()
    {
        _uowMock = new Mock<IUnitOfWork>();
        _expenseRepoMock = new Mock<IExpenseRepository>();
        _uowMock.Setup(u => u.Expenses).Returns(_expenseRepoMock.Object);

        var mapperConfig = new AutoMapper.MapperConfiguration(cfg =>
            cfg.AddProfile<Optrixa.Application.Mappings.MappingProfile>());
        var mapper = mapperConfig.CreateMapper();

        _handler = new CreateExpenseCommandHandler(_uowMock.Object, mapper);
    }

    [Fact]
    public async Task Handle_ValidExpense_ReturnsSuccess()
    {
        var dto = new CreateExpenseDto
        {
            Title = "Office Rent",
            CategoryId = 1,
            Amount = 1500.00m,
            ExpenseDate = DateTime.UtcNow
        };

        _expenseRepoMock
            .Setup(r => r.AddAsync(It.IsAny<Expense>()))
            .ReturnsAsync((Expense e) => e);

        _uowMock
            .Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        var result = await _handler.Handle(
            new CreateExpenseCommand(dto, "user-123"),
            CancellationToken.None);

        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Office Rent", result.Data!.Title);
        Assert.Equal(1500.00m, result.Data.Amount);
    }

    [Fact]
    public async Task Handle_ValidExpense_SetsUserIdCorrectly()
    {
        var dto = new CreateExpenseDto
        {
            Title = "Transport",
            CategoryId = 2,
            Amount = 200.00m,
            ExpenseDate = DateTime.UtcNow
        };

        Expense? capturedExpense = null;

        _expenseRepoMock
            .Setup(r => r.AddAsync(It.IsAny<Expense>()))
            .Callback<Expense>(e => capturedExpense = e)
            .ReturnsAsync((Expense e) => e);

        _uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        await _handler.Handle(
            new CreateExpenseCommand(dto, "user-abc-123"),
            CancellationToken.None);

        Assert.NotNull(capturedExpense);
        Assert.Equal("user-abc-123", capturedExpense!.UserId);
    }
}