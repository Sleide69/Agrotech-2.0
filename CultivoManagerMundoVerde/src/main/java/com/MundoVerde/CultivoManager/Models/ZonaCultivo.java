package com.MundoVerde.CultivoManager.Models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "zonas")
public class ZonaCultivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    // Puede usarse un Enum si deseas restringir los valores válidos
    private String ubicacion; // Ej: "Norte", "Sur", etc.

    private String tipoSuelo;

    private String cultivoActual;

    @JsonIgnore
    @OneToMany(mappedBy = "zonaCultivo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sensor> sensores;

    @JsonIgnore
    @OneToMany(mappedBy = "zonaCultivo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Riego> riegos;

    // Constructor por defecto
    public ZonaCultivo() {}

    // Getters y Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public String getTipoSuelo() {
        return tipoSuelo;
    }

    public void setTipoSuelo(String tipoSuelo) {
        this.tipoSuelo = tipoSuelo;
    }

    public String getCultivoActual() {
        return cultivoActual;
    }

    public void setCultivoActual(String cultivoActual) {
        this.cultivoActual = cultivoActual;
    }

    public List<Sensor> getSensores() {
        return sensores;
    }

    public void setSensores(List<Sensor> sensores) {
        this.sensores = sensores;
    }

    public List<Riego> getRiegos() {
        return riegos;
    }

    public void setRiegos(List<Riego> riegos) {
        this.riegos = riegos;
    }
}


