namespace ApiColegio.Dtos.Auth
{
    public class LoginRequestDto
    {
        public string Usuario { get; set; } = null!;
        public string Contrasena { get; set; } = null!;
    }
}

