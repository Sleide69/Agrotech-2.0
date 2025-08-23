using System.Threading.Tasks;

namespace ExportModule.Services.Interfaces
{
    public interface IConsultaApiService
    {
        Task<int> EjecutarConsultaAsync();
    }
}
