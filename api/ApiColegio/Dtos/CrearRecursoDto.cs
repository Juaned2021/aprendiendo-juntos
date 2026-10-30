namespace ApiColegio.Dtos
{
    public class CrearRecursoDto
    {
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public string Ruta { get; set; }
        public string Tipo { get; set; }
        public int idClase { get; set; }
    }
}
