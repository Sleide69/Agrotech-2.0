using Microsoft.EntityFrameworkCore;
using ExportModule.Models;

namespace ExportModule.Data.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<ConsultaAPI> ConsultaAPIs { get; set; }
        public DbSet<Cultivo> Cultivos { get; set; }
        public DbSet<Plaga> Plagas { get; set; }
        public DbSet<DatosAExportar> DatosAExportar { get; set; }
        public DbSet<TareaProgramada> TareasProgramadas { get; set; }
    }
}
