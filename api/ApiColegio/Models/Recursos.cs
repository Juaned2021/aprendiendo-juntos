using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class Recursos
    {

        [Key]public int idRecurso { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public string Ruta { get; set; }
        public string estado { get; set; }
        public string Tipo { get; set; }
        public DateTime fechaCreacion { get; set; }
        public int idclaseFK { get; set; }
    }

}
