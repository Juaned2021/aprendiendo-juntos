using ApiColegio;
using ApiColegio.Dtos;
using ApiColegio.Models;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/recursos")]
[Authorize]
public class RecursosController : ControllerBase
{
    private readonly contextDb _context;

    public RecursosController(contextDb context)
    {
        _context = context;
    }




    [Authorize]
    [HttpPost("{idClase}/recurso")]
    public async Task<IActionResult> SubirRecurso(
    int idClase,
    IFormFile archivo,
    string descripcion,
    [FromServices] ICloudinary cloudinary)
    {
        var idUsuario = int.Parse(
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
        );

        // 🔐 Validar que el usuario es profesor de la clase
        var esProfesorDeClase = await (
            from c in _context.clase
            join p in _context.Profesor on c.idProfesorFK equals p.idProfesor
            where c.idclase == idClase
                  && p.idUsuarioFK == idUsuario
            select c
        ).AnyAsync();

        if (!esProfesorDeClase)
            return Forbid("No puedes subir recursos a esta clase");

        if (archivo == null || archivo.Length == 0)
            return BadRequest("Archivo inválido");

        using var stream = archivo.OpenReadStream();

        var uploadParams = new CloudinaryDotNet.Actions.RawUploadParams
        {
            File = new FileDescription(archivo.FileName, stream),
            Folder = $"clases/{idClase}"
        };

        var uploadResult = await cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
            return BadRequest(uploadResult.Error.Message);

        var recurso = new Recursos
        {
            Nombre = archivo.FileName,
            Descripcion = descripcion,
            Ruta = uploadResult.SecureUrl.ToString(), // aquí guardamos la URL
            estado = "Activo",
            Tipo = archivo.ContentType,
            fechaCreacion = DateTime.UtcNow,
            idclaseFK = idClase
        };

        _context.Recursos.Add(recurso);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            recurso.idRecurso,
            recurso.Nombre,
            recurso.Descripcion,
            recurso.Ruta,
            recurso.Tipo,
            Fecha = recurso.fechaCreacion.ToString()
        });
    }
    // 🔥 DELETE: api/clases/recurso/5
    [HttpDelete("recurso/{idRecurso}")]
    [Authorize]
    public async Task<IActionResult> EliminarRecurso(int idRecurso)
    {
        var idUsuario = int.Parse(
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
        );

        // 🔎 1️⃣ Buscar si el usuario es profesor
        var profesor = await _context.Profesor
            .FirstOrDefaultAsync(p => p.idUsuarioFK == idUsuario);

        if (profesor == null)
            return Unauthorized("Solo los profesores pueden eliminar recursos.");

        // 🔎 2️⃣ Buscar el recurso junto con su clase
        var recurso = await (
            from r in _context.Recursos
            join c in _context.clase on r.idclaseFK equals c.idclase
            where r.idRecurso == idRecurso
            select new { r, c }
        ).FirstOrDefaultAsync();

        if (recurso == null)
            return NotFound("Recurso no encontrado.");

        // 🔐 3️⃣ Validar que el profesor sea dueño de la clase
        if (recurso.c.idProfesorFK != profesor.idProfesor)
            return Forbid("No tienes permiso para eliminar este recurso.");

        // 🗑 4️⃣ Eliminación lógica
        recurso.r.estado = "Inactivo";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Recurso eliminado correctamente (lógico)."
        });
    }

    [HttpGet("mis-recursos")]
    [Authorize]
    public async Task<IActionResult> MisRecursos()
    {
        var idUsuario = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value
        );

        // Buscar si es profesor
        var profesor = await (
            from p in _context.Profesor
            where p.idUsuarioFK == idUsuario
            select p.idProfesor
        ).FirstOrDefaultAsync();

        if (profesor != 0)
        {
            var recursosProfesor = await (
                from r in _context.Recursos
                join c in _context.clase on r.idclaseFK equals c.idclase
                join m in _context.Materias on c.idMateriaFK equals m.idMateria
                where c.idProfesorFK == profesor
                    && r.estado == "Activo"

                    // No es recurso de una tarea
                    && !_context.Tarea.Any(t => t.idrecursofk == r.idRecurso)

                    // No es recurso subido por un alumno
                    && !_context.EntregaTarea.Any(e => e.idrecursofk == r.idRecurso)

                orderby r.fechaCreacion descending

                select new
                {
                    r.idRecurso,
                    r.Nombre,
                    r.Descripcion,
                    r.Ruta,
                    r.Tipo,
                    r.fechaCreacion,

                    Grado = c.grado,
                    Grupo = c.grupo,
                    Materia = m.Nombre,

                    Rol = "Profesor"
                }
            ).ToListAsync();

            return Ok(recursosProfesor);
        }

        // Buscar si es alumno
        var alumno = await (
            from a in _context.Alumnos
            where a.idUsuarioFK == idUsuario
            select a.idAlumno
        ).FirstOrDefaultAsync();

        if (alumno != 0)
        {
            var recursosAlumno = await (
                from r in _context.Recursos
                join c in _context.clase on r.idclaseFK equals c.idclase
                join m in _context.Materias on c.idMateriaFK equals m.idMateria
                join ac in _context.AlumnoClase
                    on c.idclase equals ac.clase_idclase

                where ac.Alumnos_idAlumno == alumno
                    && r.estado == "Activo"

                    // No es recurso de una tarea
                    && !_context.Tarea.Any(t => t.idrecursofk == r.idRecurso)

                    // No es recurso de una entrega
                    && !_context.EntregaTarea.Any(e => e.idrecursofk == r.idRecurso)

                orderby r.fechaCreacion descending

                select new
                {
                    r.idRecurso,
                    r.Nombre,
                    r.Descripcion,
                    r.Ruta,
                    r.Tipo,
                    r.fechaCreacion,

                    Grado = c.grado,
                    Grupo = c.grupo,
                    Materia = m.Nombre,

                    Rol = "Alumno"
                }
            ).Distinct().ToListAsync();

            return Ok(recursosAlumno);
        }

        return BadRequest("El usuario no es profesor ni alumno.");
    }
}


