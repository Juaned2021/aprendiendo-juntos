using ApiColegio;
using ApiColegio.Dtos;
using ApiColegio.Controllers;
using ApiColegio.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


[ApiController]
[Route("api/admin/usuarios")]


public class AdminUsuariosController : ControllerBase
{
    private readonly contextDb _context;

    public AdminUsuariosController(contextDb context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CrearUsuario(CreateUsuarioDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // 🔐 Validar usuario único
        if (await _context.Usuarios.AnyAsync(u => u.Usuario == dto.Usuario))
            return BadRequest("El usuario ya existe");

        // 🔎 Validar rol antes de crear usuario
        var rol = await _context.Roles
            .FirstOrDefaultAsync(r => r.nombre == dto.Rol);

        if (rol == null)
            return BadRequest("Rol inválido");

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 🔒 Hashear contraseña
            var hash = BCrypt.Net.BCrypt.HashPassword(dto.Contrasena);

            // 👤 Crear usuario
            var usuario = new Usuarios
            {
                Nombre = dto.Nombre,
                Apellido1 = dto.Apellido1,
                Apellido2 = dto.Apellido2,
                Usuario = dto.Usuario,
                Contrasena = hash,
                Identificacion = dto.Identificacion,
                Direccion = dto.Direccion ?? "",
                estado = "Activo"
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            // 🎭 Asignar rol
            _context.UsuarioRol.Add(new UsuarioRol
            {
                idUsuarioFK = usuario.idUsuario,
                idRolFK = rol.idRol
            });

            // 👨‍🎓 Si es Alumno
            if (rol.nombre == "Alumno")
            {
                _context.Alumnos.Add(new Alumnos
                {
                    idUsuarioFK = usuario.idUsuario,
                    estado = "Activo"
                });
            }

            // 👨‍🏫 Si es Profesor
            if (rol.nombre == "Profesor")
            {
                _context.Profesor.Add(new Profesor
                {
                    idUsuarioFK = usuario.idUsuario,
                    Estado = "Activo"
                });
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new
            {
                mensaje = "Usuario creado correctamente",
                usuarioId = usuario.idUsuario
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "Error al crear el usuario");
        }
    }
    [HttpGet]
    public async Task<IActionResult> ListarUsuarios()
    {
        try
        {
            var usuarios = await _context.Usuarios
                .Where(u => u.estado == "Activo" || u.estado == "Inactivo")
                .Select(u => new UsuarioListDto
                {
                    IdUsuario = u.idUsuario,
                    Nombre = u.Nombre,
                    Apellido1 = u.Apellido1,
                    Apellido2 = u.Apellido2,
                    Usuario = u.Usuario,
                    Identificacion = u.Identificacion,
                    Direccion = u.Direccion,
                    Estado = u.estado,
                    Roles = _context.UsuarioRol
                        .Where(ur => ur.idUsuarioFK == u.idUsuario)
                        .Join(_context.Roles,
                            ur => ur.idRolFK,
                            r => r.idRol,
                            (ur, r) => r.nombre)
                        .ToList()
                })
                .ToListAsync();

        
            

            return Ok(usuarios);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error en ListarUsuarios: {ex.Message}");
            return StatusCode(500, "Error del servidor");
        }
    }
    // PUT: api/admin/usuarios/{id}
    [HttpPatch("{id}")]
    public async Task<IActionResult> PatchUsuario(int id, [FromBody] UpdateUsuarioDto dto)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
            return NotFound("Usuario no encontrado");

        // Actualizar solo los campos enviados

        if (dto.Nombre != null)
            usuario.Nombre = dto.Nombre;

        if (dto.Apellido1 != null)
            usuario.Apellido1 = dto.Apellido1;

        if (dto.Apellido2 != null)
            usuario.Apellido2 = dto.Apellido2;

        if (dto.Direccion != null)
            usuario.Direccion = dto.Direccion;

        if (dto.Identificacion != null)
            usuario.Identificacion = dto.Identificacion;

        if (dto.Estado != null)
            usuario.estado = dto.Estado;

        if (dto.Contrasena != null)
            usuario.Contrasena = BCrypt.Net.BCrypt.HashPassword(dto.Contrasena);

        // actualizar estado en alumno
        var alumno = await _context.Alumnos
            .FirstOrDefaultAsync(a => a.idUsuarioFK == id);

        if (alumno != null && dto.Estado != null)
            alumno.estado = dto.Estado;

        // actualizar estado en profesor
        var profesor = await _context.Profesor
            .FirstOrDefaultAsync(p => p.idUsuarioFK == id);

        if (profesor != null && dto.Estado != null)
            profesor.Estado = dto.Estado;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Usuario actualizado parcialmente"
        });
    }
    [HttpGet("profesores")]
    
    public async Task<IActionResult> ListarProfesores()
    {
        var profesores = await _context.Profesor
            .Where(p => p.Estado == "Activo")
            .Join(
                _context.Usuarios,
                p => p.idUsuarioFK,
                u => u.idUsuario,
                (p, u) => new ProfesorSelectDto
                {
                    IdProfesor = p.idProfesor,
                    Nombre = u.Nombre + " " + u.Apellido1
                }
            )
            .ToListAsync();

        return Ok(profesores);
    }

}

