namespace Optrixa.Domain.Common;

// Every entity inherits this — gives us Id, timestamps, and soft delete for free.
// "Soft delete" means IsDeleted = true instead of physically removing the row,
// so you can recover data and keep audit history.
public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;
}