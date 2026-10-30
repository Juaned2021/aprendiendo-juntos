using ApiColegio.Dtos;
using ApiColegio.Models;
using CloudinaryDotNet;
using CloudinaryDotNet.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiColegio.Controllers
{
    [ApiController]
    [Route("api/clases")]
    [Authorize]
    public class ClasesController : ControllerBase
    {
        private readonly contextDb _context;

        public ClasesController(contextDb context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CrearClase(CrearClaseDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1️⃣ Crear clase
                var clase = new clase
                {
                    periodo = dto.Periodo,
                    grupo = dto.Grupo,
                    modalidad = dto.Modalidad,
                    grado = dto.Grado,
                    ano = dto.Ano,
                    idMateriaFK = dto.IdMateria,
                    idProfesorFK = dto.IdProfesor,
                    estado = "Activo"
                };

                _context.clase.Add(clase);
                await _context.SaveChangesAsync();

                // 2️⃣ Insertar alumnos
                foreach (var idAlumno in dto.Alumnos)
                {
                    _context.AlumnoClase.Add(new AlumnoClase
                    {
                        clase_idclase = clase.idclase,
                        Alumnos_idAlumno = idAlumno,
                        fechaInscripcion = DateTime.UtcNow,
                        estado = "Activo"
                    });
                }

                // 3️⃣ Insertar horarios
                foreach (var h in dto.Horarios)
                {
                    _context.Horario.Add(new Horario
                    {
                        idclaseFK = clase.idclase,
                        DiaSemana = h.DiaSemana,
                        HoraInicio = TimeOnly.Parse(h.HoraInicio),
                        HoraFin = TimeOnly.Parse(h.HoraFin),
                        aula = h.Aula,
                        tipo = h.Tipo
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    mensaje = "Clase creada correctamente",
                    idClase = clase.idclase
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                var error = ex.InnerException?.Message ?? ex.Message;

                return BadRequest(new
                {
                    error = error,
                    full = ex.ToString()
                });
            }
        }
        [HttpPut("{idClase}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EditarClase(int idClase, CrearClaseDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var clase = await _context.clase
                    .FirstOrDefaultAsync(c => c.idclase == idClase);

                if (clase == null)
                    return NotFound("La clase no existe");

                // 1️⃣ Actualizar datos básicos (INCLUYE ESTADO)
                clase.periodo = dto.Periodo;
                clase.grupo = dto.Grupo;
                clase.grado = dto.Grado;
                clase.modalidad = dto.Modalidad;
                clase.ano = dto.Ano;
                clase.idMateriaFK = dto.IdMateria;
                clase.idProfesorFK = dto.IdProfesor;
                clase.estado = dto.Estado; // 👈 NUEVO

                await _context.SaveChangesAsync();

                // 2️⃣ Eliminar alumnos anteriores
                var alumnosActuales = await _context.AlumnoClase
                    .AsNoTracking()
                    .Where(a => a.clase_idclase == idClase)
                    .ToListAsync();

                _context.AlumnoClase.RemoveRange(alumnosActuales);
                await _context.SaveChangesAsync();

                // 3️⃣ Insertar alumnos nuevos
                var nuevosAlumnos = dto.Alumnos
                    .Distinct()
                    .Select(idAlumno => new AlumnoClase
                    {
                        clase_idclase = idClase,
                        Alumnos_idAlumno = idAlumno,
                        fechaInscripcion = DateTime.UtcNow,
                        estado = "Activo"
                    })
                    .ToList();

                _context.AlumnoClase.AddRange(nuevosAlumnos);
                await _context.SaveChangesAsync();

                // 4️⃣ Eliminar horarios anteriores
                var horariosActuales = await _context.Horario
                    .AsNoTracking()
                    .Where(h => h.idclaseFK == idClase)
                    .ToListAsync();

                _context.Horario.RemoveRange(horariosActuales);
                await _context.SaveChangesAsync();

                // 5️⃣ Insertar horarios nuevos
                var nuevosHorarios = dto.Horarios.Select(h => new Horario
                {
                    idclaseFK = idClase,
                    DiaSemana = h.DiaSemana,
                    HoraInicio = TimeOnly.Parse(h.HoraInicio),
                    HoraFin = TimeOnly.Parse(h.HoraFin),
                    aula = h.Aula,
                    tipo = h.Tipo
                }).ToList();

                _context.Horario.AddRange(nuevosHorarios);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new
                {
                    mensaje = "Clase actualizada correctamente",
                    idClase,
                    estadoActual = clase.estado // 👈 opcional, para confirmar
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new
                {
                    error = "Error al actualizar la clase",
                    detalle = ex.InnerException?.Message ?? ex.Message
                });
            }
        }


        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ListarClases()
        {
            var clases = await _context.clase

                .Join(_context.Materias,
                    c => c.idMateriaFK,
                    m => m.idMateria,
                    (c, m) => new { c, m })
                .Join(_context.Profesor,
                    cm => cm.c.idProfesorFK,
                    p => p.idProfesor,
                    (cm, p) => new { cm.c, cm.m, p })
                .Join(_context.Usuarios,
                    cmp => cmp.p.idUsuarioFK,
                    u => u.idUsuario,
                    (cmp, u) => new ClaseListDto
                    {
                        IdClase = cmp.c.idclase,
                        Periodo = cmp.c.periodo,
                        Grado = cmp.c.grado,
                        Grupo = cmp.c.grupo,
                        Modalidad = cmp.c.modalidad, // 👈 NUEVO
                        Materia = cmp.m.Nombre,
                        Profesor = u.Nombre + " " + u.Apellido1,
                        Estado = cmp.c.estado
                    })
                .ToListAsync();

            return Ok(clases);
        }

        [HttpGet("{idClase}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ObtenerClase(int idClase)
        {
            var clase = await _context.clase
                .FirstOrDefaultAsync(c => c.idclase == idClase);

            if (clase == null)
                return NotFound();

            var alumnos = await _context.AlumnoClase
                .Where(ac => ac.clase_idclase == idClase && ac.estado == "Activo")
                .Join(
                    _context.Alumnos.Where(a => a.estado == "Activo"),
                    ac => ac.Alumnos_idAlumno,
                    a => a.idAlumno,
                    (ac, a) => a
                )
                .Join(
                    _context.Usuarios.Where(u => u.estado == "Activo"),
                    a => a.idUsuarioFK,
                    u => u.idUsuario,
                    (a, u) => new AlumnoSelectDto
                    {
                        IdAlumno = a.idAlumno,
                        Nombre = u.Nombre + " " + u.Apellido1 + " " + u.Apellido2
                    }
                )
                .ToListAsync();

            var horarios = await _context.Horario
                .Where(h => h.idclaseFK == idClase)
                .Select(h => new HorarioDto
                {
                    DiaSemana = h.DiaSemana,
                    HoraInicio = h.HoraInicio.ToString(),
                    HoraFin = h.HoraFin.ToString(),
                    Aula = h.aula,
                    Tipo = h.tipo
                })
                .ToListAsync();

            return Ok(new
            {
                clase.idclase,
                clase.periodo,
                clase.grado,
                clase.grupo,
                clase.modalidad,
                clase.ano,
                clase.idMateriaFK,
                clase.idProfesorFK,
                Alumnos = alumnos,
                Horarios = horarios
            });
        }
        // 🔥 GET: api/clases/profesor/5
        [HttpGet("profesor/{idUsuario}")]
        [Authorize]
        public async Task<IActionResult> GetClasesPorProfesor(int idUsuario)
        {
            // 🔎 1️⃣ Buscar profesor asociado al usuario
            var profesor = await _context.Profesor
                .FirstOrDefaultAsync(p => p.idUsuarioFK == idUsuario);

            if (profesor == null)
                return NotFound("No existe un profesor asociado a este usuario.");

            // 🔎 2️⃣ Obtener clases con nombre de materia
            var clases = await (
                from c in _context.clase
                join m in _context.Materias on c.idMateriaFK equals m.idMateria
                where c.idProfesorFK == profesor.idProfesor
                      && c.estado == "Activo"
                orderby c.periodo descending
                select new
                {
                    c.idclase,
                    c.grupo,
                    c.periodo,
                    c.modalidad,
                    c.grado,
                    c.ano,
                    c.idProfesorFK,
                    Materia = m.Nombre
                }
            ).ToListAsync();

            return Ok(clases);
        }

    }
}



