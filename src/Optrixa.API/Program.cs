using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Optrixa.Application;
using Optrixa.Infrastructure;
using Optrixa.API.Middleware;
using Serilog;
using System.Text;
using Optrixa.API;

var builder = WebApplication.CreateBuilder(args);

// ── Serilog Logging ────────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .WriteTo.File("logs/optrixa-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();
builder.Host.UseSerilog();

// ── Controllers + Swagger ──────────────────────────────────────────────────
builder.Services.AddControllers().AddJsonOptions(x =>
    {
        x.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Optrixa API", Version = "v1" });

    // Adds the JWT authorize button to Swagger UI
    c.AddSecurityDefinition("Bearer", new()
    {
        Description = "JWT Authorization header. Enter: Bearer {your token}",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new()
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ── Application + Infrastructure Layers ───────────────────────────────────
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);


// ── JWT Authentication ─────────────────────────────────────────────────────
var tokenSettings = builder.Configuration.GetSection("TokenSettings");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = tokenSettings["Issuer"],
        ValidAudience = tokenSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(tokenSettings["SecretKey"]!))
    };
});

// ── CORS for React Frontend ────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
        policy.WithOrigins("http://localhost:5173")  // Vite default port
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// ── Build the App ──────────────────────────────────────────────────────────
var app = builder.Build();

// ── Seed Database ──────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    await DbSeeder.SeedAsync(scope.ServiceProvider);
}

// ── Middleware Pipeline ────────────────────────────────────────────────────
// Order matters here — don't rearrange these

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Optrixa API v1");
        c.RoutePrefix = string.Empty; // Swagger opens at root URL
    });
}

app.UseMiddleware<ExceptionMiddleware>();  // Must be first — catches all errors
app.UseSerilogRequestLogging();           // Logs every HTTP request
app.UseHttpsRedirection();
app.UseCors("ReactApp");                  // Must be before UseAuthentication
app.UseAuthentication();                  // Who are you?
app.UseAuthorization();                   // What are you allowed to do?
app.MapControllers();

app.Run();