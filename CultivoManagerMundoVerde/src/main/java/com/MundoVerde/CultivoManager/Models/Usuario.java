package com.MundoVerde.CultivoManager.Models;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "usuarios")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String rol; 

    private LocalDate fechaRegistro;

    // Constructor por defecto
    public Usuario() {
        this.fechaRegistro = LocalDate.now();
    }

    // Getters y Setters normales (sin cambiar)
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    @JsonIgnore
    public String getPassword() { return password; }

    public void setPassword(String password) { this.password = password; }

    public String getRol() { return rol; }

    public void setRol(String rol) { this.rol = rol; }

    public LocalDate getFechaRegistro() { return fechaRegistro; }

    public void setFechaRegistro(LocalDate fechaRegistro) { this.fechaRegistro = fechaRegistro; }


    // Métodos de UserDetails
    @JsonIgnore
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROL: " + this.rol.toUpperCase()));
    }

    @JsonIgnore
    @Override
    public String getUsername() {
        return this.email; 
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonExpired() {
        return true; // Podrías manejarlo con un campo boolean si quieres
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonLocked() {
        return true; // Podrías manejarlo con un campo boolean si quieres
    }

    @JsonIgnore
    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Lo mismo, personalizable
    }

    @JsonIgnore
    @Override
    public boolean isEnabled() {
        return true; // Lo mismo, puedes tener un campo `activo` para manejar esto
    }
}
