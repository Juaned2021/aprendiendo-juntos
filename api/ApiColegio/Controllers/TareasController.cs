using ApiColegio;
using ApiColegio.Dtos;
using ApiColegio.Models;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class TareasController : ControllerBase
{
    private readonly contextDb _context;
    public TareasController(contextDb context)
    {
        _context = context;
    }

    // GET: api/Tarea
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Tarea>>> GetTarea()
    {
        return await _context.Tarea.ToListAsync();
    }

    // GET: api/Tarea/5
    [HttpGet("{idtarea}")]
    public async Task<ActionResult<Tarea>> GetTarea(int idtarea)
    {
        var tarea = await _context.Tarea.FindAsync(idtarea);

        if (tarea == null)
        {
            return NotFound();
        }

        return tarea;
    }

    // PUT: api/Tarea/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{idtarea}")]
    public async Task<IActionResult> PutTarea(int? idtarea, Tarea tarea)
    {
        if (idtarea != tarea.idtarea)
        {
            return BadRequest();
        }

        _context.Entry(tarea).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TareaExists(idtarea))
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

    // POST: api/Tarea
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Tarea>> PostTarea(Tarea tarea)
    {
        _context.Tarea.Add(tarea);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetTarea", new { idtarea = tarea.idtarea }, tarea);
    }

    // DELETE: api/Tarea/5
    [HttpDelete("{idtarea}")]
    public async Task<IActionResult> DeleteTarea(int? idtarea)
    {
        var tarea = await _context.Tarea.FindAsync(idtarea);
        if (tarea == null)
        {
            return NotFound();
        }

        _context.Tarea.Remove(tarea);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize(Roles = "Profesor")]
    [HttpGet("tareas")]
    public async Task<IActionResult> ObtenerMisTareas()
    {
        var idUsuario = int.Parse(
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
        );

        var tareas = await (
            from t in _context.Tarea
            join c in _context.clase on t.idclasefk equals c.idclase
            join p in _context.Profesor on c.idProfesorFK equals p.idProfesor

            // LEFT JOIN con Recursos
            join r in _context.Recursos
                on t.idrecursofk equals r.idRecurso into recursos
            from r in recursos.DefaultIfEmpty()

            where p.idUsuarioFK == idUsuario
                  && t.estado != "Eliminada"

            select new
            {
                t.idtarea,
                t.titulo,
                t.descripcion,
                t.fechacreacion,
                t.fechalimite,
                t.estado,
                t.idclasefk,
                t.idrecursofk,

                // Datos del recurso
                NombreArchivo = r != null ? r.Nombre : null,
                DescripcionRecurso = r != null ? r.Descripcion : null,
                RutaArchivo = r != null ? r.Ruta : null,
                TipoArchivo = r != null ? r.Tipo : null
            }
        ).ToListAsync();

        return Ok(tareas);
    }
    [Authorize(Roles = "Profesor")]
    [HttpPost("{idClase}/CrearTarea")]
    public async Task<IActionResult> CrearTarea(
    int idClase,
    string titulo,
    string descripcion,
    DateTime fechaLimite,
    IFormFile? archivo,
    string? descripcionRecurso,
    [FromServices] ICloudinary cloudinary)
    {
        try
        {
            var idUsuario = int.Parse(
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
            );

            //  Validar que el profesor pertenece a la clase
            var esProfesorDeClase = await (
                from c in _context.clase
                join p in _context.Profesor on c.idProfesorFK equals p.idProfesor
                where c.idclase == idClase
                      && p.idUsuarioFK == idUsuario
                select c
            ).AnyAsync();

            if (!esProfesorDeClase)
                return Forbid("No puedes crear tareas en esta clase");

            int? idRecursoCreado = null;

            //  Si viene archivo, subirlo a Cloudinary y crear recurso
            if (archivo != null && archivo.Length > 0)
            {
                using var stream = archivo.OpenReadStream();

                var uploadParams = new CloudinaryDotNet.Actions.RawUploadParams
                {
                    File = new FileDescription(archivo.FileName, stream),
                    Folder = $"clases/{idClase}/tareas"
                };

                var uploadResult = await cloudinary.UploadAsync(uploadParams);

                if (uploadResult.Error != null)
                    return BadRequest(uploadResult.Error.Message);

                var recurso = new Recursos
                {
                    Nombre = archivo.FileName,
                    Descripcion = descripcionRecurso ?? $"Recurso de la tarea {titulo}",
                    Ruta = uploadResult.SecureUrl.ToString(),
                    estado = "Activo",
                    Tipo = archivo.ContentType,
                    fechaCreacion = DateTime.UtcNow,
                    idclaseFK = idClase
                };

                _context.Recursos.Add(recurso);
                await _context.SaveChangesAsync();

                idRecursoCreado = recurso.idRecurso;
            }

            //  Crear tarea
            var tarea = new Tarea
            {
                titulo = titulo,
                descripcion = descripcion,
                fechacreacion = DateTime.UtcNow,
                fechalimite = fechaLimite,
                estado = "Pendiente",
                idclasefk = idClase,
                idrecursofk = idRecursoCreado
            };

            _context.Tarea.Add(tarea);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Tarea creada correctamente",
                tarea.idtarea,
                tarea.titulo,
                tarea.descripcion,
                tarea.fechacreacion,
                tarea.fechalimite,
                tarea.estado,
                tarea.idclasefk,
                tarea.idrecursofk
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                mensaje = "Error al crear la tarea",
                error = ex.Message
            });
        }
    }
    [Authorize(Roles = "Profesor")]
    [HttpPatch("tareas/{idTarea}")]
    public async Task<IActionResult> EditarTarea(
    int idTarea,
    EditarTareaDto dto)
    {
        var idUsuario = int.Parse(
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
        );

        // Validar que la tarea pertenezca a una clase del profesor
        var tarea = await (
            from t in _context.Tarea
            join c in _context.clase on t.idclasefk equals c.idclase
            join p in _context.Profesor on c.idProfesorFK equals p.idProfesor
            where t.idtarea == idTarea
                  && p.idUsuarioFK == idUsuario
                  && t.estado != "Eliminada"
            select t
        ).FirstOrDefaultAsync();

        if (tarea == null)
            return NotFound("La tarea no existe o no te pertenece.");

        // Actualización parcial
        if (!string.IsNullOrWhiteSpace(dto.titulo))
            tarea.titulo = dto.titulo;

        if (!string.IsNullOrWhiteSpace(dto.descripcion))
            tarea.descripcion = dto.descripcion;

        if (dto.fechalimite.HasValue)
            tarea.fechalimite = dto.fechalimite.Value;

        if (!string.IsNullOrWhiteSpace(dto.estado))
            tarea.estado = dto.estado;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Tarea actualizada correctamente",
            tarea.idtarea,
            tarea.titulo,
            tarea.descripcion,
            tarea.fechalimite,
            tarea.estado
        });
    }
    private bool TareaExists(int? idtarea)
    {
        return _context.Tarea.Any(e => e.idtarea == idtarea);
    }
}
