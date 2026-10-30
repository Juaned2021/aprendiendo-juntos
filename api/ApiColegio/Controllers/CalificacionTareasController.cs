using ApiColegio;
using ApiColegio.Dtos;
using ApiColegio.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class CalificacionTareasController : ControllerBase
{
    private readonly contextDb _context;
    public CalificacionTareasController(contextDb context)
    {
        _context = context;
    }

    // GET: api/CalificacionTarea
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CalificacionTarea>>> GetCalificacionTarea()
    {
        return await _context.CalificacionTarea.ToListAsync();
    }

    // GET: api/CalificacionTarea/5
    [HttpGet("{idcalificacion}")]
    public async Task<ActionResult<CalificacionTarea>> GetCalificacionTarea(int idcalificacion)
    {
        var calificaciontarea = await _context.CalificacionTarea.FindAsync(idcalificacion);

        if (calificaciontarea == null)
        {
            return NotFound();
        }

        return calificaciontarea;
    }

    // PUT: api/CalificacionTarea/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{idcalificacion}")]
    public async Task<IActionResult> PutCalificacionTarea(int? idcalificacion, CalificacionTarea calificaciontarea)
    {
        if (idcalificacion != calificaciontarea.idcalificacion)
        {
            return BadRequest();
        }

        _context.Entry(calificaciontarea).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CalificacionTareaExists(idcalificacion))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // POST: api/CalificacionTarea
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<CalificacionTarea>> PostCalificacionTarea(CalificacionTarea calificaciontarea)
    {
        _context.CalificacionTarea.Add(calificaciontarea);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetCalificacionTarea", new { idcalificacion = calificaciontarea.idcalificacion }, calificaciontarea);
    }

    // DELETE: api/CalificacionTarea/5
    [HttpDelete("{idcalificacion}")]
    public async Task<IActionResult> DeleteCalificacionTarea(int? idcalificacion)
    {
        var calificaciontarea = await _context.CalificacionTarea.FindAsync(idcalificacion);
        if (calificaciontarea == null)
        {
            return NotFound();
        }

        _context.CalificacionTarea.Remove(calificaciontarea);
        await _context.SaveChangesAsync();

        return NoContent();
    }
    [Authorize(Roles = "Profesor")]
    [HttpPatch("entregas/{idEntrega}/calificacion")]
    public async Task<IActionResult> CalificarEntrega(
    int idEntrega,
    CalificarEntregaDto dto)
    {
        var idUsuario = int.Parse(
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
        );

        // Validar que la entrega pertenezca a una tarea del profesor
        var entrega = await (
            from e in _context.EntregaTarea

            join t in _context.Tarea
                on e.idtareafk equals t.idtarea

            join c in _context.clase
                on t.idclasefk equals c.idclase

            join p in _context.Profesor
                on c.idProfesorFK equals p.idProfesor

            where e.identrega == idEntrega
                && p.idUsuarioFK == idUsuario

            select e

        ).FirstOrDefaultAsync();

        if (entrega == null)
            return NotFound("La entrega no existe o no pertenece a una de tus clases.");

        // Buscar si ya existe una calificación
        var calificacion = await _context.Set<CalificacionTarea>()
            .FirstOrDefaultAsync(c => c.identregafk == idEntrega);

        if (calificacion == null)
        {
            // Crear nueva calificación
            calificacion = new CalificacionTarea
            {
                nota = dto.nota,
                observacion = dto.observacion,
                fechacalificacion = DateTime.Now,
                identregafk = idEntrega
            };

            _context.Add(calificacion);
        }
        else
        {
            // Actualizar calificación existente
            calificacion.nota = dto.nota;
            calificacion.observacion = dto.observacion;
            calificacion.fechacalificacion = DateTime.Now;
        }

        // Cambiar estado de la entrega
        entrega.estado = "Calificada";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Calificación guardada correctamente.",

            entrega.identrega,

            entrega.estado,

            calificacion.idcalificacion,

            calificacion.nota,

            calificacion.observacion,

            calificacion.fechacalificacion
        });
    }
    private bool CalificacionTareaExists(int? idcalificacion)
    {
        return _context.CalificacionTarea.Any(e => e.idcalificacion == idcalificacion);
    }
}
