using System.Globalization;

namespace ApiColegio.Dtos
{
    public class UpdateUsuarioDto
    {
        public string? Nombre { get; set; }
        public string? Apellido1 { get; set; }
        public string? Apellido2 { get; set; }
        public string? Direccion { get; set; }
        public string? Estado { get; set; }
        public string? Identificacion { get; set; }
        public string? Contrasena { get; set; }


        // Activo / Inactivo
    }
}
