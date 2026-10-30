using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class Usuarios
    {
        [Key] public int idUsuario { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellido1 { get; set; } = string.Empty;
        public string? Apellido2 { get; set; } = string.Empty;
        public string Usuario { get; set; } = string.Empty;

        public string Contrasena { get; set; } = string.Empty;
        public string Identificacion { get; set; } = string.Empty;
        public string? Direccion { get; set; } = string.Empty;
        public string estado { get; set; } = string.Empty;
        
      

    }

}
