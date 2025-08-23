using System;

namespace ExportModule.Models
{
    public class DatosAExportar
    {
        public int Id { get; set; }
        public DateTime FechaExportacion { get; set; }
        public string? TipoDato { get; set; }
        public string? Formato { get; set; }
        public string? Contenido { get; set; }

        public int? CultivoId { get; set; }
        public Cultivo? Cultivo { get; set; }

        public int? PlagaId { get; set; }
        public Plaga? Plaga { get; set; }

        public int? ConsultaAPIId { get; set; }
        public ConsultaAPI? ConsultaAPI { get; set; }
    }
}
