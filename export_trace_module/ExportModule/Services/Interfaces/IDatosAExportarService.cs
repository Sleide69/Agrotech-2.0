using System.Threading.Tasks;

namespace ExportModule.Services.Interfaces
{
    public interface IDatosAExportarService
    {
        Task<int?> RegistrarExportacionAsync(int cultivoId, string tipoDato, string formato, string contenido);
    }
}
