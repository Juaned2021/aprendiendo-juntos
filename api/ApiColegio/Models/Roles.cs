using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class Roles
    {
        [Key] public int idRol { get; set; }
        public string nombre { get; set; } = string.Empty;
    }

}
