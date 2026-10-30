using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiColegio.Controllers
{
    [Route("api/admin/observaciones")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ObservacionesAdminController : ControllerBase
    {
        private readonly contextDb _context;

        public ObservacionesAdminController(contextDb context)
        {
            _context = context;
        }

        // ✅ Ver todas con info completa
        [HttpGet]
        public async Task<IActionResult> GetObservaciones()
        {
            var observaciones = await _context.Observaciones
                .Join(_context.Alumnos,
                    o => o.idAlumnoFK,
                    a => a.idAlumno,
                    (o, a) => new { o, a })
                .Join(_context.Usuarios,
                    oa => oa.a.idUsuarioFK,
                    u => u.idUsuario,
                    (oa, uAlumno) => new { oa.o, AlumnoNombre = uAlumno.Nombre + " " + uAlumno.Apellido1 })
                .Join(_context.Profesor,
                    temp => temp.o.idProfesorFK,
                    p => p.idProfesor,
                    (temp, p) => new { temp.o, temp.AlumnoNombre, p })
                .Join(_context.Usuarios,
                    temp2 => temp2.p.idUsuarioFK,
                    u => u.idUsuario,
                    (temp2, uProfesor) => new
                    {
                        temp2.o.idObservacion,
                        temp2.o.encabezado,
                        temp2.o.descripcion,
                        temp2.o.estado,
                        temp2.o.fechaObservacion,
                        Alumno = temp2.AlumnoNombre,
                        Profesor = uProfesor.Nombre + " " + uProfesor.Apellido1
                    })
                .ToListAsync();

            return Ok(observaciones);
        }

        // ✅ Cambiar estado
        [HttpPut("estado/{id}")]
        public async Task<IActionResult> CambiarEstado(int id, string estado)
        {
            var obs = await _context.Observaciones.FindAsync(id);
            if (obs == null) return NotFound();

            obs.estado = estado;
            await _context.SaveChangesAsync();

            return Ok("Estado actualizado");
        }

        // ✅ Eliminar
        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var obs = await _context.Observaciones.FindAsync(id);
            if (obs == null) return NotFound();

            _context.Observaciones.Remove(obs);
            await _context.SaveChangesAsync();

            return Ok("Observación eliminada");
        }
    }
}
