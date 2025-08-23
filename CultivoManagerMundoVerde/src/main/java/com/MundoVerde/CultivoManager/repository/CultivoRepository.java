package com.MundoVerde.CultivoManager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.MundoVerde.CultivoManager.Models.Cultivo;

public interface CultivoRepository extends JpaRepository<Cultivo, Long> {
}
