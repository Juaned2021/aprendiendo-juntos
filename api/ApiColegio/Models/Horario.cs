using System.ComponentModel.DataAnnotations;

namespace ApiColegio.Models
{
    public class Horario
    {
        [Key] public int? idHorario { get; set; }
        public string? aula { get; set; } = string.Empty;
        public TimeOnly? HoraInicio { get; set; }
        public TimeOnly? HoraFin { get; set; }
        public string? DiaSemana { get; set; } = string.Empty;
        public string? tipo { get; set; } = string.Empty;
        public int? idclaseFK { get; set; }
      
    }

}
