using ExportModule.Data.Context;
using ExportModule.Models;
using ExportModule.Services.Interfaces;

namespace ExportModule.Services.Implementaciones
{
    public class DatosAExportarService : IDatosAExportarService
    {
        private readonly AppDbContext _context;

        public DatosAExportarService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<int?> RegistrarExportacionAsync(int cultivoId, string tipoDato, string formato, string contenido)
        {
            var cultivo = await _context.Cultivos.FindAsync(cultivoId);
            if (cultivo == null)
                return null;

            var exportacion = new DatosAExportar
            {
                FechaExportacion = DateTime.UtcNow,
                TipoDato = tipoDato,
                Formato = formato,
                Contenido = contenido,
                Cultivo = cultivo
            };

            _context.DatosAExportar.Add(exportacion);
            await _context.SaveChangesAsync();

            return exportacion.Id;
        }
    }
}
