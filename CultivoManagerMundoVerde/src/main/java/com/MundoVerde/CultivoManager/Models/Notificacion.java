package com.MundoVerde.CultivoManager.Models;

import java.time.LocalDateTime;

public class Notificacion {
    private String mensaje;
    private String tipo;
    private LocalDateTime fecha;

    public Notificacion() {
    }

    public Notificacion(String mensaje, String tipo, LocalDateTime fecha) {
        this.mensaje = mensaje;
        this.tipo = tipo;
        this.fecha = fecha;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
