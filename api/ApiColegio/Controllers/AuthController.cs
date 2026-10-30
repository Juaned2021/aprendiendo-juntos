using ApiColegio;
using ApiColegio.Dtos.Auth;
using ApiColegio.Models;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly contextDb _context;
    private readonly IConfiguration _config;

    public AuthController(contextDb context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDto dto)
    {
        // 1️⃣ Buscar usuario
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Usuario == dto.Usuario && u.estado == "Activo");

        if (usuario == null)
            return Unauthorized("Credenciales inválidas");

        // 2️⃣ Verificar contraseña
        if (!BCrypt.Net.BCrypt.Verify(dto.Contrasena, usuario.Contrasena))
            return Unauthorized("Credenciales inválidas");

        // ✅ 3️⃣ Guardar acceso
        var acceso = new accesos
        {
            fecha = DateTime.UtcNow,
            idUsuarioFK = usuario.idUsuario
        };

        _context.accesos.Add(acceso);
        await _context.SaveChangesAsync();

        // 4️⃣ Obtener roles
        var roles = await _context.UsuarioRol
            .Where(ur => ur.idUsuarioFK == usuario.idUsuario)
            .Join(
                _context.Roles,
                ur => ur.idRolFK,
                r => r.idRol,
                (ur, r) => r.nombre
            )
            .ToListAsync();

        // 5️⃣ Claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.idUsuario.ToString()),
            new Claim(ClaimTypes.Name, usuario.Usuario)
        };

        foreach (var rol in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, rol));
        }

        // 6️⃣ JWT
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
        );

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                int.Parse(_config["Jwt:ExpireMinutes"]!)
            ),
            signingCredentials: new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            )
        );

        return Ok(new LoginResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Expira = token.ValidTo,
            IdUsuario = usuario.idUsuario,
            Roles = roles
        });
    }

}