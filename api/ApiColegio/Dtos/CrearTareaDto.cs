namespace ApiColegio.Dtos
{
    public class CrearTareaDto
    {
        public string titulo { get; set; }

        public string? descripcion { get; set; }

        public DateTime fechalimite { get; set; }

        public int? idrecursofk { get; set; }
    }
}
