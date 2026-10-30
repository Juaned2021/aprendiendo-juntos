namespace ApiColegio.Dtos
{
    public class ClaseDetalleDto
    {
        public int IdClase { get; set; }
        public string Periodo { get; set; }
        public string Grado { get; set; }
        public string Grupo { get; set; }
        public string Modalidad { get; set; }
        public string Ano { get; set; }
        public int IdMateria { get; set; }
        public int IdProfesor { get; set; }
        public List<AlumnoSelectDto> Alumnos { get; set; }
        public List<HorarioDto> Horarios { get; set; }
    }
}
