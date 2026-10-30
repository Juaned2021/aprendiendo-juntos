using ApiColegio.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ApiColegio.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfesorController : ControllerBase
    {
        private readonly contextDb _context;

        public ProfesorController(contextDb context)
        {
            _context = context;
        }

        [HttpGet("mis-estudiantes")]
        [Authorize(Roles = "Profesor")]
        public async Task<IActionResult> GetMisEstudiantes()
        {
            // 🔐 Obtener el Id del usuario desde el token
            var idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            // 🔎 Buscar el profesor asociado a ese usuario
            var profesor = await _context.Profesor
                .FirstOrDefaultAsync(p => p.idUsuarioFK == idUsuario);

            if (profesor == null)
                return NotFound("Profesor no encontrado.");

            // 🔎 Traer estudiantes de sus clases
            var estudiantes = await
            (
                from c in _context.clase
                join ac in _context.AlumnoClase on c.idclase equals ac.clase_idclase
                join a in _context.Alumnos on ac.Alumnos_idAlumno equals a.idAlumno
                join u in _context.Usuarios on a.idUsuarioFK equals u.idUsuario
                where c.idProfesorFK == profesor.idProfesor
                      && ac.estado == "Activo"
                select new EstudianteProfesorDto
                {
                    IdAlumno = a.idAlumno,
                    NombreCompleto = u.Nombre + " " + u.Apellido1 + " " + u.Apellido2,
                    Identificacion = u.Identificacion,
                    Grado = c.grado,
                    Grupo = c.grupo
                }
            )
            .Distinct()
            .ToListAsync();

            return Ok(estudiantes);
        }
    }
}
