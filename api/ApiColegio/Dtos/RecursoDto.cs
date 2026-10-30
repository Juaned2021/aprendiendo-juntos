namespace ApiColegio.Dtos
{
    public class RecursoDto
    {
        public int IdClase { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public string ruta { get; set; } = string.Empty;
        public string? Estado { get; set; }
    }
}
