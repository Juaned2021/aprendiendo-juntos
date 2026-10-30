using ApiColegio.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ApiColegio.Controllers
{
    [ApiController]
    [Route("api/horarios")]
    [Authorize]
    public class HorarioController : ControllerBase
    {
        private readonly contextDb _context;

        public HorarioController(contextDb context)
        {
            _context = context;
        }

        // 🔹 1. Listar TODOS los horarios
        [HttpGet]
        public async Task<IActionResult> GetHorarios()
        {
            var horarios = await
            (
                from h in _context.Horario
                join c in _context.clase on h.idclaseFK equals c.idclase
                join m in _context.Materias on c.idMateriaFK equals m.idMateria
                join p in _context.Profesor on c.idProfesorFK equals p.idProfesor
                join u in _context.Usuarios on p.idUsuarioFK equals u.idUsuario
                where c.estado == "Activo"
                select new
                {
                    h.idHorario,
                    h.DiaSemana,
                    HoraInicio = h.HoraInicio.ToString(),
                    HoraFin = h.HoraFin.ToString(),
                    h.aula,
                    h.tipo,

                    Clase = new
                    {
                        c.idclase,
                        c.grado,
                        c.grupo,
                        c.periodo,
                        c.modalidad,
                        c.estado
                    },

                    Materia = m.Nombre,
                    Profesor = u.Nombre + " " + u.Apellido1
                }
            ).ToListAsync();

            return Ok(horarios);
        }

        // 🔹 2. Horario por GRADO
        [HttpGet("grado/{grado}/grupo/{grupo}")]
        public async Task<IActionResult> GetHorarioPorGradoYGrupo(string grado, string grupo)
        {
            var horarios = await
            (
                from h in _context.Horario
                join c in _context.clase on h.idclaseFK equals c.idclase
                join m in _context.Materias on c.idMateriaFK equals m.idMateria
                where c.grado == grado && c.grupo == grupo
                select new
                {
                    h.DiaSemana,
                    HoraInicio = h.HoraInicio.ToString(),
                    HoraFin = h.HoraFin.ToString(),
                    h.aula,
                    h.tipo,
                    Materia = m.Nombre
                }
            ).ToListAsync();

            return Ok(horarios);
        }

        // 🔹 3. Horario por PROFESOR
        [HttpGet("profesor/usuario/{idUsuario}")]
        [Authorize(Roles = "Profesor")]
        public async Task<IActionResult> GetHorarioPorProfesor(int idUsuario)
        {
            // 1️⃣ Validar que el usuario sea profesor y obtener idProfesor
            var idProfesor = await
            (
                from p in _context.Profesor
                where p.idUsuarioFK == idUsuario
                      && p.Estado == "Activo"
                select p.idProfesor
            ).FirstOrDefaultAsync();

            if (idProfesor == 0)
                return BadRequest("El usuario no es profesor");

            // 2️⃣ Obtener horario del profesor
            var horarios = await
            (
                from h in _context.Horario
                join c in _context.clase on h.idclaseFK equals c.idclase
                join m in _context.Materias on c.idMateriaFK equals m.idMateria
                where c.idProfesorFK == idProfesor
                      && c.estado == "Activo"
                select new
                {
                    h.DiaSemana,
                    HoraInicio = h.HoraInicio.ToString(),
                    HoraFin = h.HoraFin.ToString(),
                    h.aula,
                    Materia = m.Nombre,
                    Grado = c.grado,
                    Grupo = c.grupo
                }
            ).ToListAsync();

            return Ok(horarios);
        }

        // 🔹 4. Horario por ALUMNO
        [HttpGet("alumno/{idAlumno}")]
        public async Task<IActionResult> GetHorarioPorAlumno(int idAlumno)
        {
            var horarios = await
            (
                from ac in _context.AlumnoClase
                join c in _context.clase on ac.clase_idclase equals c.idclase
                join h in _context.Horario on c.idclase equals h.idclaseFK
                join m in _context.Materias on c.idMateriaFK equals m.idMateria
                where ac.Alumnos_idAlumno == idAlumno
                select new
                {
                    h.DiaSemana,
                    HoraInicio = h.HoraInicio.ToString(),
                    HoraFin = h.HoraFin.ToString(),
                    h.aula,
                    Materia = m.Nombre,
                    Grado = c.grado,
                    Grupo = c.grupo
                }
            ).ToListAsync();

            return Ok(horarios);
        }

        [HttpGet("mi-horario")]
        [Authorize]
        public async Task<IActionResult> MiHorario()
        {
            var idUsuario = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value
            );

            // 🔎 1️⃣ Verificar si es Profesor
            var profesorId = await (
                from p in _context.Profesor
                where p.idUsuarioFK == idUsuario
                select p.idProfesor
            ).FirstOrDefaultAsync();

            if (profesorId != 0)
            {
                var horarioProfesor = await (
                    from h in _context.Horario
                    join c in _context.clase on h.idclaseFK equals c.idclase
                    join m in _context.Materias on c.idMateriaFK equals m.idMateria
                    where c.idProfesorFK == profesorId
                    && c.estado == "Activo"
                    orderby h.DiaSemana, h.HoraInicio
                    select new
                    {
                        h.idHorario,
                        h.DiaSemana,
                        HoraInicio = h.HoraInicio.ToString(),
                        HoraFin = h.HoraFin.ToString(),
                        h.aula,
                        h.tipo,

                        Grado = c.grado,
                        Grupo = c.grupo,
                        Periodo = c.periodo,
                        Materia = m.Nombre,

                        Rol = "Profesor"
                    }
                ).ToListAsync();

                return Ok(horarioProfesor);
            }

            // 🔎 2️⃣ Verificar si es Alumno
            var alumnoId = await (
                from a in _context.Alumnos
                where a.idUsuarioFK == idUsuario
                select a.idAlumno
            ).FirstOrDefaultAsync();

            if (alumnoId != 0)
            {
                var horarioAlumno = await (
                    from h in _context.Horario
                    join c in _context.clase on h.idclaseFK equals c.idclase
                    join m in _context.Materias on c.idMateriaFK equals m.idMateria
                    join ac in _context.AlumnoClase
                        on c.idclase equals ac.clase_idclase
                    where ac.Alumnos_idAlumno == alumnoId
                    && c.estado == "Activo"
                    orderby h.DiaSemana, h.HoraInicio
                    select new
                    {
                        h.idHorario,
                        h.DiaSemana,
                        HoraInicio = h.HoraInicio.ToString(),
                        HoraFin = h.HoraFin.ToString(),
                        h.aula,
                        h.tipo,

                        Grado = c.grado,
                        Grupo = c.grupo,
                        Periodo = c.periodo,
                        Materia = m.Nombre,

                        Rol = "Alumno"
                    }
                ).Distinct().ToListAsync();

                return Ok(horarioAlumno);
            }

            return BadRequest("El usuario no es profesor ni alumno.");
        }
    }
}
