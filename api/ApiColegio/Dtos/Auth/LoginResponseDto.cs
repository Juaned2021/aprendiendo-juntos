namespace ApiColegio.Dtos.Auth
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = null!;
        public DateTime Expira { get; set; }
        public int IdUsuario { get; set; }
        public List<string> Roles { get; set; } = new();
    }
}
