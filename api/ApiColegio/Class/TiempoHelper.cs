namespace ApiColegio.Class
{
    public static class TiempoHelper
    {
        public static string HaceCuanto(DateTime fecha)
        {
            var tiempo = DateTime.UtcNow - fecha;

            if (tiempo.TotalMinutes < 1)
                return "Hace unos segundos";

            if (tiempo.TotalMinutes < 60)
                return $"Hace {(int)tiempo.TotalMinutes} minutos";

            if (tiempo.TotalHours < 24)
                return $"Hace {(int)tiempo.TotalHours} horas";

            if (tiempo.TotalDays < 30)
                return $"Hace {(int)tiempo.TotalDays} días";

            if (tiempo.TotalDays < 365)
                return $"Hace {(int)(tiempo.TotalDays / 30)} meses";

            return $"Hace {(int)(tiempo.TotalDays / 365)} años";
        }
    }
}
