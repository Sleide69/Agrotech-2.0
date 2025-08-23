package com.MundoVerde.CultivoManager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.MundoVerde.CultivoManager.Models.Riego;

@Repository
public interface RiegoRepository extends JpaRepository<Riego, Long> {
}
