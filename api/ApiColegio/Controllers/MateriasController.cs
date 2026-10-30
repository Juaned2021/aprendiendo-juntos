using ApiColegio.Dtos;
using ApiColegio.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiColegio.Controllers
{
    [ApiController]
    [Route("api/materias")]
    [Authorize] // cualquiera logueado
    public class MateriasController : ControllerBase
    {
        private readonly contextDb _context;

        public MateriasController(contextDb context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMaterias()
        {
            var materias = await _context.Materias
                .Where(m => m.estado == "Activo" || m.estado == "Inactivo")
                .Select(m => new
                {
                    m.idMateria,
                    m.Nombre,
                    m.Area,
                    m.estado
                })
                .ToListAsync();

            return Ok(materias);
        }
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Crear(MateriaDto dto)
        {
            var materia = new Materias
            {
                Nombre = dto.Nombre,
                Area = dto.Area,
                estado = dto.Estado ?? "Activo"
            };

            _context.Materias.Add(materia);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Materia creada correctamente",
                idMateria = materia.idMateria
            });
        }
        [HttpPut("{id}")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> Editar(int id, MateriaDto dto)
{
    var materia = await _context.Materias.FindAsync(id);

    if (materia == null)
        return NotFound("Materia no encontrada");

    materia.Nombre = dto.Nombre;
    materia.Area = dto.Area;
    materia.estado = dto.Estado ?? materia.estado;

    await _context.SaveChangesAsync();

    return Ok("Materia actualizada correctamente");
}

    }
}
