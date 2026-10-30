using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class AlumnoClase
    {
        [Key] public int clase_idclase { get; set; }
        public int Alumnos_idAlumno { get; set; }
        public DateTime? fechaInscripcion { get; set; }
        public string? estado { get; set; } = string.Empty;
   
    }

}
