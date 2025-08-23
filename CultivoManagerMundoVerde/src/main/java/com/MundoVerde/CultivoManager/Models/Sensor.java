package com.MundoVerde.CultivoManager.Models;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import jakarta.persistence.*;

@Entity
@Table(name = "sensores")
public class Sensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo; // Ej: "Humedad", "Temperatura", etc.

    private String modelo;

    private String unidadMedida;

    @ManyToOne
    @JoinColumn(name = "zona_cultivo_id", nullable = false)
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
    @JsonIdentityReference(alwaysAsId = true)
    private ZonaCultivo zonaCultivo;

    // Constructor por defecto
    public Sensor() {}

    // Getters y Setters

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getTipo() { return tipo; }

    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getModelo() { return modelo; }

    public void setModelo(String modelo) { this.modelo = modelo; }

    public String getUnidadMedida() { return unidadMedida; }

    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }

    public ZonaCultivo getZonaCultivo() { return zonaCultivo; }

    public void setZonaCultivo(ZonaCultivo zonaCultivo) { this.zonaCultivo = zonaCultivo; }
}
