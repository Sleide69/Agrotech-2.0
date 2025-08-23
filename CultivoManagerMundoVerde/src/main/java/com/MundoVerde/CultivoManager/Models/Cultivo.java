package com.MundoVerde.CultivoManager.Models;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Cultivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String tipoPlanta;
    private String zona;
    private LocalDate fechaSiembra;

    // Constructor por defecto
    public Cultivo() {
        this.fechaSiembra = LocalDate.now();
    }

    // Getters y Setters

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }

    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTipoPlanta() { return tipoPlanta; }

    public void setTipoPlanta(String tipoPlanta) { this.tipoPlanta = tipoPlanta; }

    public String getZona() { return zona; }

    public void setZona(String zona) { this.zona = zona; }

    public LocalDate getFechaSiembra() { return fechaSiembra; }

    public void setFechaSiembra(LocalDate fechaSiembra) { this.fechaSiembra = fechaSiembra; }
}
