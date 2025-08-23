package com.MundoVerde.CultivoManager.service;

import com.MundoVerde.CultivoManager.Models.Riego;
import com.MundoVerde.CultivoManager.repository.RiegoRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RiegoService {

    private final RiegoRepository riegoRepository;

    public RiegoService(RiegoRepository riegoRepository) {
        this.riegoRepository = riegoRepository;
    }

    public List<Riego> getAll() {
        return riegoRepository.findAll();
    }

    public Optional<Riego> getById(Long id) {
        return riegoRepository.findById(id);
    }

    public Riego save(Riego riego) {
        return riegoRepository.save(riego);
    }

    public void delete(Long id) {
        riegoRepository.deleteById(id);
    }
}
