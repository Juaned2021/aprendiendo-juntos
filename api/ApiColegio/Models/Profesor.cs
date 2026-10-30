using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class Profesor
    {
        [Key] public int idProfesor { get; set; }
        public int idUsuarioFK { get; set; }
        public string Estado { get; set; } = string.Empty;
    }

}
