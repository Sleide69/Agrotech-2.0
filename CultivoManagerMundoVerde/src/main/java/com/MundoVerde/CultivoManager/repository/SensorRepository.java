package com.MundoVerde.CultivoManager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.MundoVerde.CultivoManager.Models.Sensor;

@Repository
public interface SensorRepository extends JpaRepository<Sensor, Long> {
}
