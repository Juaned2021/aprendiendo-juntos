namespace ApiColegio.Controllers
{
     // 👈 ajusta al namespace de tu proyecto
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using System;

    
    
        [Route("api/[controller]")]
        [ApiController]
        public class DashboardController : ControllerBase
        {
            private readonly contextDb _context;

            public DashboardController(contextDb context)
            {
                _context = context;
            }

        // 📈 1. Accesos por día (últimos 7 días)
        

        // 🎓 2. Cantidad de alumnos por clase (SIN navegación)
       
        
    }
}