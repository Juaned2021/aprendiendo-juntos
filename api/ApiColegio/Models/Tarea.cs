using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class Tarea
    {
        [Key]
        public int idtarea { get; set; }

        [Required]
        public string titulo { get; set; }

        public string? descripcion { get; set; }

        public DateTime fechacreacion { get; set; } = DateTime.UtcNow;

        public DateTime? fechalimite { get; set; }

        public string estado { get; set; } = "Activo";

        public int idclasefk { get; set; }

        public int? idrecursofk { get; set; }


      

      
    }
}
