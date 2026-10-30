using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class clase
    {
        [Key] public int idclase { get; set; }
        public string periodo { get; set; } = string.Empty;
        public string grupo { get; set; } = string.Empty;
        public string modalidad { get; set; } = string.Empty;
        public string estado { get; set; } = string.Empty;
        public int idMateriaFK { get; set; }
        public string grado { get; set; } = string.Empty;
        public string? ano { get; set; }
        public int idProfesorFK { get; set; }
     
    }

}
