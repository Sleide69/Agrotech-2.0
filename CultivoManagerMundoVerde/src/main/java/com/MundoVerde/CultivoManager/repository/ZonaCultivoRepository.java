package com.MundoVerde.CultivoManager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.MundoVerde.CultivoManager.Models.ZonaCultivo;

@Repository
public interface ZonaCultivoRepository extends JpaRepository<ZonaCultivo, Long> {
}
