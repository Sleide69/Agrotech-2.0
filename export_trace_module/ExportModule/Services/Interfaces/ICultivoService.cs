using System.Threading.Tasks;

namespace ExportModule.Services.Interfaces
{
    public interface ICultivoService
    {
        Task<(bool esExportable, string motivo)> EvaluarCultivoAsync(int cultivoId);
    }
}
