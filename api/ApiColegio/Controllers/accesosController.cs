using ApiColegio;
using ApiColegio.Class;
using ApiColegio.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ApiColegio.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class accesosController : ControllerBase
    {
        private readonly contextDb _context;

        public accesosController(contextDb context)
        {
            _context = context;
        }

        // GET: api/accesos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<accesos>>> Getaccesos()
        {
            return await _context.accesos.ToListAsync();
        }

        // GET: api/accesos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<accesos>> Getaccesos(int id)
        {
            var accesos = await _context.accesos.FindAsync(id);

            if (accesos == null)
            {
                return NotFound();
            }

            return accesos;
        }


        [HttpGet("admin/ultimo-acceso")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UltimoAccesoUsuarios()
        {
            var usuarios = await _context.Usuarios
                .Where(u => u.estado == "Activo" || u.estado == "Inactivo")
                .Select(u => new
                {
                    u.idUsuario,
                    Nombre = u.Nombre + " " + u.Apellido1,
                    u.Usuario,
                    Estado = u.estado,
                    UltimoAcceso = _context.accesos
                        .Where(a => a.idUsuarioFK == u.idUsuario)
                        .OrderByDescending(a => a.fecha)
                        .Select(a => a.fecha)
                        .FirstOrDefault()
                })
                .ToListAsync();

            var resultado = usuarios.Select(u => new
            {
                u.idUsuario,
                u.Nombre,
                u.Usuario,
                u.Estado,
                UltimoAcceso = u.UltimoAcceso == default
                    ? "Nunca"
                    : TiempoHelper.HaceCuanto(u.UltimoAcceso.Value)
            });

            return Ok(resultado);
        }

        [HttpGet("profesor/ultimo-acceso-alumnos")]
        [Authorize(Roles = "Profesor")]
        public async Task<IActionResult> UltimoAccesoAlumnos()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var profesor = await _context.Profesor
                .FirstOrDefaultAsync(p => p.idUsuarioFK == userId);

            if (profesor == null)
                return NotFound();

            var alumnos = await
            (
                from c in _context.clase
                join ac in _context.AlumnoClase on c.idclase equals ac.clase_idclase
                join al in _context.Alumnos on ac.Alumnos_idAlumno equals al.idAlumno
                join u in _context.Usuarios on al.idUsuarioFK equals u.idUsuario
                where c.idProfesorFK == profesor.idProfesor
                select new
                {
                    u.idUsuario,
                    Nombre = u.Nombre + " " + u.Apellido1,
                    u.Usuario,
                    UltimoAcceso = _context.accesos
                        .Where(a => a.idUsuarioFK == u.idUsuario)
                        .OrderByDescending(a => a.fecha)
                        .Select(a => a.fecha)
                        .FirstOrDefault()
                }
            )
            .Distinct()
            .ToListAsync();

            var resultado = alumnos.Select(a => new
            {
                a.Nombre,
                a.Usuario,
                UltimoAcceso = a.UltimoAcceso == default
                    ? "Nunca"
                    : TiempoHelper.HaceCuanto(a.UltimoAcceso.Value)
            });

            return Ok(resultado);
        }
    }
}

