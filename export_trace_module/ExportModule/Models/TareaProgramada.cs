using System;

namespace ExportModule.Models
{
    public class TareaProgramada
    {
        public int Id { get; set; }
        public string? Nombre { get; set; }
        public DateTime FechaEjecucion { get; set; }
        public string? Tipo { get; set; } // evaluacion, exportacion, notificacion
        public string? Frecuencia { get; set; } // opcional
        public string? Estado { get; set; } // pendiente, ejecutada, fallida
        public DateTime? UltimoIntento { get; set; }
        public string? Resultado { get; set; }
    }
}
