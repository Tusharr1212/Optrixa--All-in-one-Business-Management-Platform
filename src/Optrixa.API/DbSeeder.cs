using Microsoft.AspNetCore.Identity;
using Optrixa.Infrastructure.Identity;

namespace Optrixa.API;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<OptrixaUser>>();

        // Create roles
        foreach (var role in new[] { "Admin", "Employee" })
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        // Create default admin user
        const string adminEmail = "admin@optrixa.com";
        if (await userManager.FindByEmailAsync(adminEmail) is null)
        {
            var admin = new OptrixaUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "Optrixa Admin",
                IsActive = true
            };

            var result = await userManager.CreateAsync(admin, "Admin@123456");
            if (result.Succeeded)
                await userManager.AddToRoleAsync(admin, "Admin");
        }
    }
}