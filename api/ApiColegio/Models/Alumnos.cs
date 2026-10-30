using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class Alumnos
    {
        [Key] public int idAlumno { get; set; }
        public int idUsuarioFK { get; set; }
        public string? estado { get; set; }

       
    }
}
