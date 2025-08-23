package com.MundoVerde.CultivoManager.service;

import com.MundoVerde.CultivoManager.Models.Sensor;
import com.MundoVerde.CultivoManager.repository.SensorRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SensorService {

    private final SensorRepository sensorRepository;

    public SensorService(SensorRepository sensorRepository) {
        this.sensorRepository = sensorRepository;
    }

    public List<Sensor> getAll() {
        return sensorRepository.findAll();
    }

    public Optional<Sensor> getById(Long id) {
        return sensorRepository.findById(id);
    }

    public Sensor save(Sensor sensor) {
        return sensorRepository.save(sensor);
    }

    public void delete(Long id) {
        sensorRepository.deleteById(id);
    }
}

