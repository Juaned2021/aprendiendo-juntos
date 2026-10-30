using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class accesos
    {
        [Key]public int idacceso { get; set; }
        public DateTime? fecha { get; set; }
        public int idUsuarioFK { get; set; }
    }

}
