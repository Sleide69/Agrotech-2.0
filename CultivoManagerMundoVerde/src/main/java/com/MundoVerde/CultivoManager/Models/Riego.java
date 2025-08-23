package com.MundoVerde.CultivoManager.Models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

@Entity
@Table(name = "riegos")
public class Riego {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double cantidadAgua; // en litros

    private LocalDateTime fechaHora;

    private String metodo; // Ej: "Aspersión", "Goteo", etc.

    @ManyToOne
    @JoinColumn(name = "zona_cultivo_id", nullable = false)
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
    @JsonIdentityReference(alwaysAsId = true)
    private ZonaCultivo zonaCultivo;

    // Constructor por defecto
    public Riego() {
        this.fechaHora = LocalDateTime.now();
    }

    // Getters y Setters

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public Double getCantidadAgua() { return cantidadAgua; }

    public void setCantidadAgua(Double cantidadAgua) { this.cantidadAgua = cantidadAgua; }

    public LocalDateTime getFechaHora() { return fechaHora; }

    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public String getMetodo() { return metodo; }

    public void setMetodo(String metodo) { this.metodo = metodo; }

    public ZonaCultivo getZonaCultivo() { return zonaCultivo; }

    public void setZonaCultivo(ZonaCultivo zonaCultivo) { this.zonaCultivo = zonaCultivo; }
}
