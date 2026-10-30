using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class CalificacionTarea
    {
        [Key]
        public int idcalificacion { get; set; }

        public decimal nota { get; set; }

        public string? observacion { get; set; }

        public DateTime fechacalificacion { get; set; } = DateTime.Now;

        public int identregafk { get; set; }

        
    }
}
