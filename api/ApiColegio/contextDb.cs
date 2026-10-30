using ApiColegio.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiColegio
{
    public class contextDb : DbContext
    {
        public DbSet<ApiColegio.Models.CalificacionTarea> CalificacionTarea { get; set; } = default!;
        public DbSet<ApiColegio.Models.EntregaTarea> EntregaTarea { get; set; } = default!;
        public DbSet<ApiColegio.Models.Tarea> Tarea { get; set; } = default!;
        public contextDb(DbContextOptions<contextDb> options) : base(options) { }

        public DbSet<Profesor> Profesor { get; set; }
        public DbSet<Observaciones> Observaciones { get; set; }
        public DbSet<Materias> Materias { get; set; }
        public DbSet<Recursos> Recursos { get; set; }
        public DbSet<Usuarios> Usuarios { get; set; }
        public DbSet<accesos> accesos { get; set; }
        public DbSet<UsuarioRol> UsuarioRol { get; set; }
        public DbSet<Roles> Roles { get; set; }
        public DbSet<Alumnos> Alumnos { get; set; }
        public DbSet<clase> clase { get; set; }
        public DbSet<Horario> Horario { get; set; }
        public DbSet<AlumnoClase> AlumnoClase { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ✅ ESQUEMA (CRÍTICO)
            modelBuilder.HasDefaultSchema("ProyectoMaestria");

            // =========================
            // TABLAS (case sensitive)
            // =========================
            modelBuilder.Entity<Usuarios>().ToTable("Usuarios");
            modelBuilder.Entity<Tarea>().ToTable("Tarea");
            modelBuilder.Entity<CalificacionTarea>().ToTable("CalificacionTarea");
            modelBuilder.Entity<EntregaTarea>().ToTable("EntregaTarea");
            modelBuilder.Entity<Roles>().ToTable("Roles");
            modelBuilder.Entity<UsuarioRol>().ToTable("UsuarioRol");
            modelBuilder.Entity<Profesor>().ToTable("Profesor");
            modelBuilder.Entity<Alumnos>().ToTable("Alumnos");
            modelBuilder.Entity<Materias>().ToTable("Materias");
            modelBuilder.Entity<Observaciones>().ToTable("Observaciones");
            modelBuilder.Entity<Recursos>().ToTable("Recursos");
            modelBuilder.Entity<accesos>().ToTable("Accesos");
            modelBuilder.Entity<clase>().ToTable("Clase");
            modelBuilder.Entity<Horario>().ToTable("Horario");
            modelBuilder.Entity<AlumnoClase>().ToTable("AlumnoClase");

            // =========================
            // CLAVE COMPUESTA
            // =========================
            modelBuilder.Entity<AlumnoClase>()
                .HasKey(ac => new { ac.clase_idclase, ac.Alumnos_idAlumno });

            // =========================
            // RELACIÓN UsuarioRol
            // =========================
            modelBuilder.Entity<UsuarioRol>()
                .HasOne<Usuarios>()
                .WithMany()
                .HasForeignKey(ur => ur.idUsuarioFK);

            modelBuilder.Entity<UsuarioRol>()
                .HasOne<Roles>()
                .WithMany()
                .HasForeignKey(ur => ur.idRolFK);

            // =========================
            // RELACIÓN Profesor
            // =========================
            modelBuilder.Entity<Profesor>()
                .HasOne<Usuarios>()
                .WithMany()
                .HasForeignKey(p => p.idUsuarioFK);

            // =========================
            // RELACIÓN Alumnos
            // =========================
            modelBuilder.Entity<Alumnos>()
                .HasOne<Usuarios>()
                .WithMany()
                .HasForeignKey(a => a.idUsuarioFK);

            // =========================
            // RELACIÓN Clase
            // =========================
            modelBuilder.Entity<clase>()
                .HasOne<Materias>()
                .WithMany()
                .HasForeignKey(c => c.idMateriaFK);

            modelBuilder.Entity<clase>()
                .HasOne<Profesor>()
                .WithMany()
                .HasForeignKey(c => c.idProfesorFK);

            // =========================
            // RELACIÓN Horario
            // =========================
            modelBuilder.Entity<Horario>()
                .HasOne<clase>()
                .WithMany()
                .HasForeignKey(h => h.idclaseFK);

            // =========================
            // RELACIÓN Recursos
            // =========================
            modelBuilder.Entity<Recursos>()
                .HasOne<clase>()
                .WithMany()
                .HasForeignKey(r => r.idclaseFK);

            // =========================
            // RELACIÓN Observaciones
            // =========================
            modelBuilder.Entity<Observaciones>()
                .HasOne<Alumnos>()
                .WithMany()
                .HasForeignKey(o => o.idAlumnoFK);

            modelBuilder.Entity<Observaciones>()
                .HasOne<Profesor>()
                .WithMany()
                .HasForeignKey(o => o.idProfesorFK);

            // =========================
            // RELACIÓN Accesos
            // =========================
            modelBuilder.Entity<accesos>()
                .HasOne<Usuarios>()
                .WithMany()
                .HasForeignKey(a => a.idUsuarioFK);

            modelBuilder.Entity<EntregaTarea>()
           .HasIndex(e => new
           {
               e.idtareafk,
               e.idalumnofk
           })
              .IsUnique();

            modelBuilder.Entity<CalificacionTarea>()
           .HasIndex(c => c.identregafk)
           .IsUnique();
        }
    }
}