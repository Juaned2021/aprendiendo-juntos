namespace ApiColegio.Dtos
{
    public class UsuarioListDto
    {
        public int IdUsuario { get; set; }
        public string Nombre { get; set; } = null!;
        public string Apellido1 { get; set; } = null!;
        public string Apellido2 { get; set; } = null!;
        public string Usuario { get; set; } = null!;

        public string Direccion { get; set; } = null!;
        public string Identificacion { get; set; } = null!;
        public string Estado { get; set; } = null!;
        public List<string> Roles { get; set; } = new();
    }
}
