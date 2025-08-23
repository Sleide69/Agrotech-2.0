using System.Collections.Generic;

namespace ExportModule.Models
{
    public class Cultivo
    {
        public int Id { get; set; }
        public required string Nombre { get; set; }
        public required string Tipo { get; set; }

        public ICollection<Plaga> Plagas { get; set; } = new List<Plaga>();
        public ICollection<DatosAExportar> DatosAExportar { get; set; } = new List<DatosAExportar>();
    }
}
