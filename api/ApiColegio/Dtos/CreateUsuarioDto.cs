using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Dtos
{
    public class CreateUsuarioDto
    {
        [Required] public string Nombre { get; set; } = null!;
        [Required] public string Apellido1 { get; set; } = null!;
        [Required] public string Apellido2 { get; set; } = null!;
        [Required] public string Usuario { get; set; } = null!;
        [Required] public string Contrasena { get; set; } = null!;
        [Required] public string Identificacion { get; set; } = null!;
        public string? Direccion { get; set; }
        [Required] public string Rol { get; set; } = null!; // Alumno | Profesor | Admin
    }
}
