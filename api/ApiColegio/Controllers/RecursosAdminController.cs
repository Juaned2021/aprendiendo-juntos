using ApiColegio;
using ApiColegio.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/admin/recursos")]
[Authorize(Roles = "Admin")]
public class RecursosAdminController : ControllerBase
{
    private readonly contextDb _context;

    public RecursosAdminController(contextDb context)
    {
        _context = context;
    }
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var recursos = await
        (
            from r in _context.Recursos
            join c in _context.clase on r.idclaseFK equals c.idclase
            join p in _context.Profesor on c.idProfesorFK equals p.idProfesor
            join u in _context.Usuarios on p.idUsuarioFK equals u.idUsuario
            select new
            {
                r.idRecurso,
                r.Nombre,
                r.Descripcion,
                r.Ruta,
                r.Tipo,
                r.estado,
                r.fechaCreacion,

                Clase = new
                {
                    c.idclase,
                    c.grado,
                    c.grupo
                },

                Profesor = u.Nombre + " " + u.Apellido1
            }
        ).ToListAsync();

        return Ok(recursos);
    }

    // ✏️ EDITAR RECURSO
    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, EditarRecursoDto dto)
    {
        var recurso = await _context.Recursos
            .FirstOrDefaultAsync(r => r.idRecurso == id);

        if (recurso == null)
            return NotFound("Recurso no encontrado");

        recurso.Nombre = dto.Nombre;
        recurso.Descripcion = dto.Descripcion;
        recurso.Ruta = dto.Ruta;
        recurso.Tipo = dto.Tipo;
        recurso.estado = dto.estado ?? recurso.estado;

        await _context.SaveChangesAsync();

        return Ok("Recurso actualizado correctamente");
    }

    // 🔴 DESACTIVAR / ACTIVAR
    [HttpPatch("{id}/estado")]
    public async Task<IActionResult> CambiarEstado(int id, [FromQuery] string estado)
    {
        if (estado != "Activo" && estado != "Inactivo")
            return BadRequest("Estado inválido");

        var recurso = await _context.Recursos
            .FirstOrDefaultAsync(r => r.idRecurso == id);

        if (recurso == null)
            return NotFound("Recurso no encontrado");

        recurso.estado = estado;
        await _context.SaveChangesAsync();

        return Ok($"Recurso {estado}");
    }

    // 🗑 ELIMINAR DEFINITIVO
    [HttpDelete("{id}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var recurso = await _context.Recursos
            .FirstOrDefaultAsync(r => r.idRecurso == id);

        if (recurso == null)
            return NotFound("Recurso no encontrado");

        _context.Recursos.Remove(recurso);
        await _context.SaveChangesAsync();

        return Ok("Recurso eliminado correctamente");
    }
}
