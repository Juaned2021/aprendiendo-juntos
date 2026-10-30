namespace ApiColegio.Dtos
{
    public class CrearClaseDto
    {
        public string Periodo { get; set; } = null!;
        public string Grupo { get; set; } = null!;
        public string Modalidad { get; set; } = null!;
        public string Grado { get; set; } = null!;
        public string Ano { get; set; } = null!;
        public string Estado { get; set; } = null!;

        public int IdMateria { get; set; }
        public int IdProfesor { get; set; }

        public List<int> Alumnos { get; set; } = new();
        public List<HorarioDto> Horarios { get; set; } = new();
    }
}
