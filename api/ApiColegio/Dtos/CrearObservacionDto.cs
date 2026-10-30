using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Dtos
{
    public class CrearObservacionDto
    {
        public int IdAlumno { get; set; }

        [Required]
        
        public string Encabezado { get; set; }

        [Required]
       
        public string Descripcion { get; set; }

    }
}
