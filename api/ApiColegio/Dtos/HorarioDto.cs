namespace ApiColegio.Dtos
{
    public class HorarioDto
    {
        public string DiaSemana { get; set; } = null!;
        public string HoraInicio { get; set; } = null!;
        public string HoraFin { get; set; } = null!;
        public string Aula { get; set; } = null!;
        public string Tipo { get; set; } = null!;
    }
}
