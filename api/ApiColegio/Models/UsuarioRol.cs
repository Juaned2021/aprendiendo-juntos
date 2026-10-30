using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class UsuarioRol
    {
        [Key] public int idUsuarioFK { get; set; }
        public int idRolFK { get; set; }
    }

}
