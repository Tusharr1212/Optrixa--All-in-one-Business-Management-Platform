// src/Optrixa.Infrastructure/Identity/OptrixaUser.cs
using Microsoft.AspNetCore.Identity;

namespace Optrixa.Infrastructure.Identity;

public class OptrixaUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}