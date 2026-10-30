using ApiColegio;
using ApiColegio.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class EntregaTareasController : ControllerBase
{
    private readonly contextDb _context;
    public EntregaTareasController(contextDb context)
    {
        _context = context;
    }

    // GET: api/EntregaTarea
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EntregaTarea>>> GetEntregaTarea()
    {
        return await _context.EntregaTarea.ToListAsync();
    }

    // GET: api/EntregaTarea/5
    [HttpGet("{identrega}")]
    public async Task<ActionResult<EntregaTarea>> GetEntregaTarea(int identrega)
    {
        var entregatarea = await _context.EntregaTarea.FindAsync(identrega);

        if (entregatarea == null)
        {
            return NotFound();
        }

        return entregatarea;
    }

    // PUT: api/EntregaTarea/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{identrega}")]
    public async Task<IActionResult> PutEntregaTarea(int? identrega, EntregaTarea entregatarea)
    {
        if (identrega != entregatarea.identrega)
        {
            return BadRequest();
        }

        _context.Entry(entregatarea).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!EntregaTareaExists(identrega))
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

    // POST: api/EntregaTarea
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<EntregaTarea>> PostEntregaTarea(EntregaTarea entregatarea)
    {
        _context.EntregaTarea.Add(entregatarea);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetEntregaTarea", new { identrega = entregatarea.identrega }, entregatarea);
    }

    // DELETE: api/EntregaTarea/5
    [HttpDelete("{identrega}")]
    public async Task<IActionResult> DeleteEntregaTarea(int? identrega)
    {
        var entregatarea = await _context.EntregaTarea.FindAsync(identrega);
        if (entregatarea == null)
        {
            return NotFound();
        }

        _context.EntregaTarea.Remove(entregatarea);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool EntregaTareaExists(int? identrega)
    {
        return _context.EntregaTarea.Any(e => e.identrega == identrega);
    }
    [Authorize(Roles = "Profesor")]
    [HttpGet("tareas/{idTarea}/entregas")]
    public async Task<IActionResult> ObtenerEntregasDeTarea(int idTarea)
    {
        var idUsuario = int.Parse(
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
        );

        // Validar que la tarea pertenezca a una clase del profesor
        var tareaPertenece = await (
            from t in _context.Tarea
            join c in _context.clase on t.idclasefk equals c.idclase
            join p in _context.Profesor on c.idProfesorFK equals p.idProfesor
            where t.idtarea == idTarea
                  && p.idUsuarioFK == idUsuario
            select t
        ).AnyAsync();

        if (!tareaPertenece)
            return Forbid("Esta tarea no pertenece a tus clases.");

        var entregas = await (
            from e in _context.EntregaTarea

            join a in _context.Alumnos
                on e.idalumnofk equals a.idAlumno

            join u in _context.Usuarios
                on a.idUsuarioFK equals u.idUsuario

            join r in _context.Recursos
                on e.idrecursofk equals r.idRecurso into recursos
            from r in recursos.DefaultIfEmpty()

            where e.idtareafk == idTarea

            select new
            {
                e.identrega,

                Alumno = u.Nombre + " " + u.Apellido1,

                e.descripcion,

                e.fechaentrega,

                e.estado,

                e.ruta,

                e.idrecursofk,

                NombreArchivo = r != null ? r.Nombre : null,

                TipoArchivo = r != null ? r.Tipo : null,

                RutaArchivo = r != null ? r.Ruta : e.ruta
            }

        ).ToListAsync();

        return Ok(entregas);
    }
    [Authorize(Roles = "Profesor")]
    [HttpGet("entregas/{idEntrega}")]
    public async Task<IActionResult> ObtenerEntrega(int idEntrega)
    {
        var idUsuario = int.Parse(
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
        );

        var entrega = await (
            from e in _context.EntregaTarea

            join t in _context.Tarea
                on e.idtareafk equals t.idtarea

            join c in _context.clase
                on t.idclasefk equals c.idclase

            join p in _context.Profesor
                on c.idProfesorFK equals p.idProfesor

            join a in _context.Alumnos
                on e.idalumnofk equals a.idAlumno

            join u in _context.Usuarios
                on a.idUsuarioFK equals u.idUsuario

            join r in _context.Recursos
                on e.idrecursofk equals r.idRecurso into recursos
            from r in recursos.DefaultIfEmpty()

            join cal in _context.Set<CalificacionTarea>()
                on e.identrega equals cal.identregafk into calificaciones
            from cal in calificaciones.DefaultIfEmpty()

            where e.identrega == idEntrega
                  && p.idUsuarioFK == idUsuario

            select new
            {
                e.identrega,

                Alumno = u.Nombre + " " + u.Apellido1,

                t.titulo,

                e.descripcion,

                e.fechaentrega,

                e.estado,

                Archivo = r != null ? r.Nombre : null,

                RutaArchivo = r != null ? r.Ruta : e.ruta,

                Nota = cal != null ? cal.nota : (decimal?)null,

                Observacion = cal != null ? cal.observacion : null,

                FechaCalificacion = cal != null ? cal.fechacalificacion : (DateTime?)null
            }

        ).FirstOrDefaultAsync();

        if (entrega == null)
            return NotFound();

        return Ok(entrega);
    }
}

