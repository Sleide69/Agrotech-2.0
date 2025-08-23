using System;
using System.Collections.Generic;

namespace ExportModule.Models
{
    public class ConsultaAPI
    {
        public int Id { get; set; }
        public string? Endpoint { get; set; }
        public DateTime Fecha { get; set; }

        public ICollection<Plaga> Plagas { get; set; } = new List<Plaga>();
        public ICollection<DatosAExportar> DatosAExportar { get; set; } = new List<DatosAExportar>();
    }
}
