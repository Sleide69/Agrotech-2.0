using System.Collections.Generic;

namespace ExportModule.Models
{
    public class Plaga
    {
        public int Id { get; set; }
        public string? Nombre { get; set; }
        public string? Nivel { get; set; } // leve, moderado, crítico

        public int CultivoId { get; set; }
        public Cultivo? Cultivo { get; set; }

        public int ConsultaAPIId { get; set; }
        public ConsultaAPI? ConsultaAPI { get; set; }

        public ICollection<DatosAExportar> DatosAExportar { get; set; } = new List<DatosAExportar>();
    }
}
