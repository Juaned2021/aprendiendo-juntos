using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class Materias
    {
        [Key] public int idMateria { get; set; }
        public string? Nombre { get; set; } 
        public string? Area { get; set; } 
        public string? estado { get; set; } 

        public DateTime? fechaCreacion { get; set; }

    }

}
