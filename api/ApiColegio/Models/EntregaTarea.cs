using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class EntregaTarea
    {
        [Key]
        public int identrega { get; set; }

        public string? descripcion { get; set; }

        public DateTime fechaentrega { get; set; } = DateTime.UtcNow;

        public string estado { get; set; } = "Enviada";

        public int idtareafk { get; set; }

        public int idalumnofk { get; set; }

        public int? idrecursofk { get; set; }

        public string? ruta { get; set; }
       
    }
}
