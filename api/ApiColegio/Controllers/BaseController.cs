using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
public class BaseController : ControllerBase
{
    protected readonly IConfiguration _config;

    public BaseController(IConfiguration config)
    {
        _config = config;
    }

    // 🔄 Método auxiliar para obtener token (cookies + headers)
    protected string GetTokenFromRequest()
    {
        // Prioridad 1: Cookie HttpOnly (nuevo método)
        var cookieToken = Request.Cookies["auth_token"];
        if (!string.IsNullOrEmpty(cookieToken))
            return cookieToken;

        // Prioridad 2: Authorization header (método antiguo)
        var authHeader = Request.Headers.Authorization.FirstOrDefault();
        if (authHeader?.StartsWith("Bearer ") == true)
        {
            return authHeader.Substring("Bearer ".Length);
        }

        return null;
    }

    // 🔄 Obtener usuario actual desde token
    protected int? GetCurrentUserId()
    {
        try
        {
            var token = GetTokenFromRequest();
            if (string.IsNullOrEmpty(token))
                return null;

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }

            return null;
        }
        catch
        {
            return null;
        }
    }

    // 🔄 Obtener roles del usuario actual
    protected List<string> GetCurrentUserRoles()
    {
        try
        {
            var token = GetTokenFromRequest();
            if (string.IsNullOrEmpty(token))
                return new List<string>();

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            return jwtToken.Claims
                .Where(x => x.Type == ClaimTypes.Role)
                .Select(x => x.Value)
                .ToList();
        }
        catch
        {
            return new List<string>();
        }
    }

    // 🔄 Verificar si el usuario tiene un rol específico
    protected bool HasRole(string role)
    {
        var roles = GetCurrentUserRoles();
        return roles.Contains(role);
    }

    // 🔄 Verificar si el usuario es Admin
    protected bool IsAdmin()
    {
        return HasRole("Admin");
    }

    // 🔄 Verificar si el usuario es Profesor
    protected bool IsProfesor()
    {
        return HasRole("Profesor");
    }

    // 🔄 Verificar si el usuario es Alumno
    protected bool IsAlumno()
    {
        return HasRole("Alumno");
    }
}
