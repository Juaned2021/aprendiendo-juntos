namespace ApiColegio.Dtos
{
    public class EditarRecursoDto
    {
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public string Ruta { get; set; }
        public string Tipo { get; set; }
        public string estado { get; set; } // Activo / Inactivo
    }
}
