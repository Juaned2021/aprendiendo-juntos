using ApiColegio.Dtos;
using ApiColegio.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ApiColegio.Controllers
{
    [Route("api/profesor/observaciones")]
    [ApiController]
    [Authorize(Roles = "Profesor")]
    public class ObservacionesProfesorController : ControllerBase
    {
        private readonly contextDb _context;

        public ObservacionesProfesorController(contextDb context)
        {
            _context = context;
        }

        // ✅ Crear observación SOLO a sus estudiantes
        [HttpPost]
        public async Task<IActionResult> Crear(CrearObservacionDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var profesor = await _context.Profesor
                .FirstOrDefaultAsync(p => p.idUsuarioFK == userId);

            if (profesor == null) return Unauthorized();

            // Validar que el alumno esté en una clase del profesor
            var alumnoValido = await _context.AlumnoClase
                .Join(_context.clase,
                    ac => ac.clase_idclase,
                    c => c.idclase,
                    (ac, c) => new { ac, c })
                .AnyAsync(x =>
                    x.ac.Alumnos_idAlumno == dto.IdAlumno &&
                    x.c.idProfesorFK == profesor.idProfesor &&
                    x.ac.estado == "Activo");

            if (!alumnoValido)
                return Forbid("No puedes hacer observaciones a este alumno.");

            var observacion = new Observaciones
            {
                encabezado = dto.Encabezado,
                descripcion = dto.Descripcion,
                estado = "Activo",
                fechaObservacion = DateTime.UtcNow,
                idAlumnoFK = dto.IdAlumno,
                idProfesorFK = profesor.idProfesor
            };

            _context.Observaciones.Add(observacion);
            await _context.SaveChangesAsync();

            return Ok("Observación creada");
        }

        // ✅ Ver las que él hizo
        [HttpGet]
        public async Task<IActionResult> MisObservaciones()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var profesor = await _context.Profesor
                .FirstOrDefaultAsync(p => p.idUsuarioFK == userId);

            if (profesor == null)
                return NotFound("Profesor no encontrado");

            var observaciones = await _context.Observaciones
                .Where(o => o.idProfesorFK == profesor.idProfesor && o.estado == "Activo")
                .ToListAsync();

            return Ok(observaciones);
        }

        // ✅ Eliminar solo las suyas
        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var profesor = await _context.Profesor
                .FirstOrDefaultAsync(p => p.idUsuarioFK == userId);

            var obs = await _context.Observaciones
                .FirstOrDefaultAsync(o => o.idObservacion == id && o.idProfesorFK == profesor.idProfesor);

            if (obs == null) return Forbid();

            _context.Observaciones.Remove(obs);
            await _context.SaveChangesAsync();

            return Ok("Observación eliminada");
        }
    }
}
