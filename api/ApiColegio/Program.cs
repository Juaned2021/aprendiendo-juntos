using ApiColegio;
using ApiColegio.Models;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

// ✅ FIX: Fuerza que todos los DateTime se traten como UTC en Npgsql
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);
Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("1234"));

// ======================================
// CONTROLLERS
// ======================================
builder.Services.AddControllers();

// ======================================
// SWAGGER
// ======================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingresa: Bearer {token}"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ======================================
// DB CONTEXT - PostgreSQL (Npgsql)
// ======================================
builder.Services.AddDbContext<contextDb>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// ======================================
// CLOUDINARY
// ======================================
builder.Services.Configure<CloudinarySettings>(
    builder.Configuration.GetSection("Cloudinary")
);
builder.Services.AddSingleton<ICloudinary>(provider =>
{
    var config = provider.GetRequiredService<IOptions<CloudinarySettings>>().Value;
    return new Cloudinary(
        new Account(config.CloudName, config.ApiKey, config.ApiSecret)
    );
});

// ======================================
// CORS
// ======================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy
            .WithOrigins("http://localhost:5173", "http://localhost:3000","https://apiaprendiendojuntos.onrender.com","https://frontend-aprendiendo-juntos.vercel.app")
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
});

// ======================================
// JWT
// ======================================
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"];
var jwtIssuer = jwtSection["Issuer"];
var jwtAudience = jwtSection["Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey!)
        )
    };
});
builder.Services.AddAuthorization();

// ======================================
// APP
// ======================================
var app = builder.Build();

// ======================================
// MIDDLEWARE
// ======================================
app.UseCors("AllowReact");
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();

// ⚠️ ORDEN CORRECTO
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
