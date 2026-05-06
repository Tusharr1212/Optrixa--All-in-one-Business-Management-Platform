// Controllers/AuthController.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Optrixa.Application.Common;
using Optrixa.Application.Features.Auth.DTOs;
using Optrixa.Domain.Entities;
using Optrixa.Infrastructure.Identity;

namespace Optrixa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<OptrixaUser> _userManager;
    private readonly SignInManager<OptrixaUser> _signInManager;
    private readonly JwtService _jwtService;

    public AuthController(
        UserManager<OptrixaUser> userManager,
        SignInManager<OptrixaUser> signInManager,
        JwtService jwtService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user is null || !user.IsActive)
            return Unauthorized(ApiResponse<AuthResponseDto>.Fail("Invalid credentials."));

        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!result.Succeeded)
            return Unauthorized(ApiResponse<AuthResponseDto>.Fail("Invalid credentials."));

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtService.GenerateToken(user, roles);

        var response = new AuthResponseDto
        {
            Token = token,
            Email = user.Email!,
            FullName = user.FullName,
            Role = roles.FirstOrDefault() ?? "Employee",
            ExpiresAt = DateTime.UtcNow.AddMinutes(480)
        };

        return Ok(ApiResponse<AuthResponseDto>.Ok(response, "Login successful."));
    }
}