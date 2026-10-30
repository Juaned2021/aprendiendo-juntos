using ApiColegio.Models;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiColegio.Controllers
{
    [ApiController]
    [Route("api/alumnos")]
    [Authorize] // solo admin crea clases
    public class AlumnosController : ControllerBase
    {
        private readonly contextDb _context;

        public AlumnosController(contextDb context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAlumnos()
        {
            var alumnos = await (
                from a in _context.Alumnos
                join u in _context.Usuarios
                    on a.idUsuarioFK equals u.idUsuario
                where a.estado == "Activo"
                select new
                {
                    IdAlumno = a.idAlumno,
                    NombreCompleto =
                        u.Nombre + " " +
                        u.Apellido1 + " " +
                        u.Apellido2
                }
            ).ToListAsync();

            return Ok(alumnos);
        }
        [Authorize]
        [HttpGet("profesor/alumnos/{idUsuario}")]
        public async Task<IActionResult> GetAlumnosDelProfesor(int idUsuario)
        {
            // 1. Obtener idProfesor desde el idUsuario
            var idProfesor = await _context.Profesor
                .Where(p => p.idUsuarioFK == idUsuario)
                .Select(p => p.idProfesor)
                .FirstOrDefaultAsync();

            if (idProfesor == 0)
                return BadRequest("El usuario no es profesor");

            // 2. Obtener alumnos únicos del profesor
            var alumnos = await
            (
                from c in _context.clase
                join ac in _context.AlumnoClase
                    on c.idclase equals ac.clase_idclase
                join a in _context.Alumnos
                    on ac.Alumnos_idAlumno equals a.idAlumno
                join u in _context.Usuarios
                    on a.idUsuarioFK equals u.idUsuario
                where c.idProfesorFK == idProfesor
                      && a.estado == "Activo"
                select new
                {
                    a.idAlumno,
                    u.idUsuario,
                    NombreCompleto = u.Nombre + " " + u.Apellido1,
                    u.Identificacion
                }
            )
            .Distinct()
            .ToListAsync();

            return Ok(alumnos);
        }
        [Authorize]
        [HttpGet("tareas")]
        public async Task<IActionResult> ObtenerMisTareas()
        {
            var idUsuario = int.Parse(
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
            );

            // Obtener el alumno
            var alumno = await _context.Alumnos
                .FirstOrDefaultAsync(a => a.idUsuarioFK == idUsuario);

            if (alumno == null)
                return NotFound("No existe el alumno.");

            var tareas = await (
                from ac in _context.AlumnoClase

                join c in _context.clase
                    on ac.clase_idclase equals c.idclase

                join t in _context.Tarea
                    on c.idclase equals t.idclasefk

                join r in _context.Recursos
                    on t.idrecursofk equals r.idRecurso into recursos
                from r in recursos.DefaultIfEmpty()

                join e in _context.EntregaTarea
                    .Where(x => x.idalumnofk == alumno.idAlumno)
                    on t.idtarea equals e.idtareafk into entregas
                from e in entregas.DefaultIfEmpty()

                where ac.Alumnos_idAlumno == alumno.idAlumno
                      && ac.estado == "Activo"
                      && t.estado != "Eliminada"

                orderby t.fechalimite

                select new
                {
                    t.idtarea,

                    t.titulo,

                    t.descripcion,

                    t.fechacreacion,

                    t.fechalimite,

                    t.estado,

                    t.idclasefk,

                    NombreArchivo = r != null ? r.Nombre : null,

                    RutaArchivo = r != null ? r.Ruta : null,

                    TipoArchivo = r != null ? r.Tipo : null,

                    YaEntregada = e != null,

                    FechaEntrega = e != null ? e.fechaentrega : (DateTime?)null,

                    EstadoEntrega = e != null ? e.estado : null
                }

            ).ToListAsync();

            return Ok(tareas);
        }
        [Authorize(Roles = "Alumno")]
        [HttpPost("tareas/{idTarea}/entrega")]
        public async Task<IActionResult> EntregarTarea(
    int idTarea,
    IFormFile archivo,
    string descripcion,
    [FromServices] ICloudinary cloudinary)
        {
            var idUsuario = int.Parse(
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
            );

            // Obtener alumno
            var alumno = await _context.Alumnos
                .FirstOrDefaultAsync(a => a.idUsuarioFK == idUsuario);

            if (alumno == null)
                return NotFound("No existe el alumno.");

            // Obtener tarea y validar que el alumno pertenezca a la clase
            var tarea = await (
                from t in _context.Tarea
                join ac in _context.AlumnoClase
                    on t.idclasefk equals ac.clase_idclase
                where t.idtarea == idTarea
                      && ac.Alumnos_idAlumno == alumno.idAlumno
                      && ac.estado == "Activo"
                select t
            ).FirstOrDefaultAsync();

            if (tarea == null)
                return Forbid("La tarea no pertenece a una de tus clases.");

            if (tarea.fechalimite < DateTime.UtcNow)
                return BadRequest("La fecha límite de la tarea ya venció.");

            // Verificar si ya existe una entrega
            var existeEntrega = await _context.EntregaTarea.AnyAsync(e =>
                e.idtareafk == idTarea &&
                e.idalumnofk == alumno.idAlumno &&
                e.estado != "Eliminada");

            if (existeEntrega)
                return Conflict("Ya entregaste esta tarea.");

            if (archivo == null || archivo.Length == 0)
                return BadRequest("Archivo inválido.");

            // Subir a Cloudinary
            using var stream = archivo.OpenReadStream();

            var uploadParams = new CloudinaryDotNet.Actions.RawUploadParams
            {
                File = new FileDescription(archivo.FileName, stream),
                Folder = $"tareas/{idTarea}/alumnos/{alumno.idAlumno}"
            };

            var uploadResult = await cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
                return BadRequest(uploadResult.Error.Message);

            // Crear recurso
            var recurso = new Recursos
            {
                Nombre = archivo.FileName,
                Descripcion = descripcion,
                Ruta = uploadResult.SecureUrl.ToString(),
                estado = "Activo",
                Tipo = archivo.ContentType,
                fechaCreacion = DateTime.UtcNow,
                idclaseFK = tarea.idclasefk
            };

            _context.Recursos.Add(recurso);
            await _context.SaveChangesAsync();

            // Crear entrega
            var entrega = new EntregaTarea
            {
                descripcion = descripcion,
                fechaentrega = DateTime.UtcNow,
                estado = "Enviada",
                idtareafk = idTarea,
                idalumnofk = alumno.idAlumno,
                idrecursofk = recurso.idRecurso,
                ruta = recurso.Ruta
            };

            _context.EntregaTarea.Add(entrega);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Tarea entregada correctamente.",
                entrega.identrega,
                entrega.fechaentrega,
                entrega.estado,
                recurso.Nombre,
                recurso.Ruta
            });
        }

        [Authorize(Roles = "Alumno")]
        [HttpGet("tareas/{idTarea}/mi-entrega")]
        public async Task<IActionResult> ObtenerMiEntrega(int idTarea)
        {
            var idUsuario = int.Parse(
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
            );

            // Obtener alumno
            var alumno = await _context.Alumnos
                .FirstOrDefaultAsync(a => a.idUsuarioFK == idUsuario);

            if (alumno == null)
                return NotFound("No existe el alumno.");

            // Verificar que la tarea pertenece a una clase del alumno
            var pertenece = await (
                from t in _context.Tarea
                join ac in _context.AlumnoClase
                    on t.idclasefk equals ac.clase_idclase
                where t.idtarea == idTarea
                    && ac.Alumnos_idAlumno == alumno.idAlumno
                    && ac.estado == "Activo"
                select t
            ).AnyAsync();

            if (!pertenece)
                return Forbid("No puedes consultar esta tarea.");

            var entrega = await (
                from e in _context.EntregaTarea

                join r in _context.Recursos
                    on e.idrecursofk equals r.idRecurso into recursos
                from r in recursos.DefaultIfEmpty()

                join c in _context.Set<CalificacionTarea>()
                    on e.identrega equals c.identregafk into calificaciones
                from c in calificaciones.DefaultIfEmpty()

                where e.idtareafk == idTarea
                    && e.idalumnofk == alumno.idAlumno
                    && e.estado != "Eliminada"

                select new
                {
                    e.identrega,
                    e.descripcion,
                    e.fechaentrega,
                    e.estado,

                    Archivo = r != null ? r.Nombre : null,
                    RutaArchivo = r != null ? r.Ruta : e.ruta,
                    TipoArchivo = r != null ? r.Tipo : null,

                    Nota = c != null ? c.nota : (decimal?)null,
                    Observacion = c != null ? c.observacion : null,
                    FechaCalificacion = c != null ? c.fechacalificacion : (DateTime?)null
                }

            ).FirstOrDefaultAsync();

            if (entrega == null)
                return NotFound("Aún no has realizado ninguna entrega para esta tarea.");

            return Ok(entrega);
        }
    
    [Authorize(Roles = "Alumno")]
        [HttpPatch("entregas/{idEntrega}")]
        public async Task<IActionResult> EditarEntrega(
    int idEntrega,
    IFormFile archivo,
    string descripcion,
    [FromServices] ICloudinary cloudinary)
        {
            var idUsuario = int.Parse(
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
            );

            // Obtener alumno
            var alumno = await _context.Alumnos
                .FirstOrDefaultAsync(a => a.idUsuarioFK == idUsuario);

            if (alumno == null)
                return NotFound("No existe el alumno.");

            // Buscar la entrega validando que pertenezca al alumno
            var entrega = await _context.EntregaTarea
                .FirstOrDefaultAsync(e =>
                    e.identrega == idEntrega &&
                    e.idalumnofk == alumno.idAlumno &&
                    e.estado != "Eliminada");

            if (entrega == null)
                return NotFound("Entrega no encontrada.");

            // Obtener la tarea
            var tarea = await _context.Tarea
                .FirstOrDefaultAsync(t => t.idtarea == entrega.idtareafk);

            if (tarea == null)
                return NotFound("La tarea no existe.");

            // Validar fecha límite
            if (DateTime.Now > tarea.fechalimite)
                return BadRequest("La fecha límite de la tarea ya venció.");

            // Validar que no esté calificada
            var calificacion = await _context.Set<CalificacionTarea>()
                .FirstOrDefaultAsync(c => c.identregafk == entrega.identrega);

            if (calificacion != null)
                return BadRequest("La entrega ya fue calificada y no puede modificarse.");

            if (archivo == null || archivo.Length == 0)
                return BadRequest("Archivo inválido.");

            // Subir nuevo archivo
            using var stream = archivo.OpenReadStream();

            var uploadParams = new CloudinaryDotNet.Actions.RawUploadParams
            {
                File = new FileDescription(archivo.FileName, stream),
                Folder = $"tareas/{tarea.idtarea}/alumnos/{alumno.idAlumno}"
            };

            var uploadResult = await cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
                return BadRequest(uploadResult.Error.Message);

            // Buscar recurso asociado
            Recursos? recurso = null;

            if (entrega.idrecursofk.HasValue)
            {
                recurso = await _context.Recursos
                    .FirstOrDefaultAsync(r => r.idRecurso == entrega.idrecursofk.Value);
            }

            if (recurso != null)
            {
                // Actualizar recurso existente
                recurso.Nombre = archivo.FileName;
                recurso.Descripcion = descripcion;
                recurso.Ruta = uploadResult.SecureUrl.ToString();
                recurso.Tipo = archivo.ContentType;
                recurso.fechaCreacion = DateTime.Now;
            }
            else
            {
                // Crear nuevo recurso
                recurso = new Recursos
                {
                    Nombre = archivo.FileName,
                    Descripcion = descripcion,
                    Ruta = uploadResult.SecureUrl.ToString(),
                    Tipo = archivo.ContentType,
                    estado = "Activo",
                    fechaCreacion = DateTime.Now,
                    idclaseFK = tarea.idclasefk
                };

                _context.Recursos.Add(recurso);
                await _context.SaveChangesAsync();

                entrega.idrecursofk = recurso.idRecurso;
            }

            // Actualizar entrega
            entrega.descripcion = descripcion;
            entrega.fechaentrega = DateTime.Now;
            entrega.ruta = recurso.Ruta;
            entrega.estado = "Enviada";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Entrega actualizada correctamente.",
                entrega.identrega,
                entrega.fechaentrega,
                entrega.estado,
                recurso.Nombre,
                recurso.Ruta
            });
        }
    }
}