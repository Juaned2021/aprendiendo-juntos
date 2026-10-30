using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ApiColegio.Controllers
{
    [Route("api/alumno/observaciones")]
    [ApiController]
    [Authorize(Roles = "Alumno")]
    public class ObservacionesAlumnoController : ControllerBase
    {
        private readonly contextDb _context;

        public ObservacionesAlumnoController(contextDb context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> MisObservaciones()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var alumno = await _context.Alumnos
                .FirstOrDefaultAsync(a => a.idUsuarioFK == userId);

            if (alumno == null) return Unauthorized();

            var observaciones = await _context.Observaciones
                .Where(o => o.idAlumnoFK == alumno.idAlumno && o.estado == "Activo")
                .Select(o => new
                {
                    o.encabezado,
                    o.descripcion,
                    o.fechaObservacion
                })
                .ToListAsync();

            return Ok(observaciones);
        }
    }
}