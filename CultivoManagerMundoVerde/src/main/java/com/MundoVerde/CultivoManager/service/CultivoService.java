package com.MundoVerde.CultivoManager.service;

import org.springframework.stereotype.Service;

import com.MundoVerde.CultivoManager.Models.Cultivo;
import com.MundoVerde.CultivoManager.repository.CultivoRepository;

import java.util.List;

@Service
public class CultivoService {

    private final CultivoRepository cultivoRepository;

    public CultivoService(CultivoRepository cultivoRepository) {
        this.cultivoRepository = cultivoRepository;
    }

    public List<Cultivo> obtenerTodos() {
        return cultivoRepository.findAll();
    }

    public Cultivo guardar(Cultivo cultivo) {
        return cultivoRepository.save(cultivo);
    }

    public Cultivo obtenerPorId(Long id) {
        return cultivoRepository.findById(id).orElse(null);
    }

    public void eliminar(Long id) {
        cultivoRepository.deleteById(id);
    }
}

