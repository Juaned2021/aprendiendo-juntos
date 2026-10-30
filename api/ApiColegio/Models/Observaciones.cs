using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class Observaciones
    {
        [Key] public int idObservacion { get; set; }
        public string? encabezado { get; set; } 
        public string? descripcion { get; set; } 
        public int? idAlumnoFK { get; set; }
        public int? idProfesorFK { get; set; }
        public string estado { get; set; }

        public DateTime? fechaObservacion { get; set; }
    }

}
