package com.MundoVerde.CultivoManager.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.MundoVerde.CultivoManager.Models.Cultivo;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class CultivoRepositoryTest {

    @Autowired
    private CultivoRepository cultivoRepository;

    @Test
    void guardarYBuscarPorId() {
        Cultivo cultivo = new Cultivo();
        cultivo.setNombre("Frijol");

        Cultivo guardado = cultivoRepository.save(cultivo);
        Optional<Cultivo> encontrado = cultivoRepository.findById(guardado.getId());

        assertTrue(encontrado.isPresent());
        assertEquals("Frijol", encontrado.get().getNombre());
    }

    @Test
    void eliminarCultivo() {
        Cultivo cultivo = new Cultivo();
        cultivo.setNombre("Lenteja");

        Cultivo guardado = cultivoRepository.save(cultivo);
        cultivoRepository.deleteById(guardado.getId());

        Optional<Cultivo> encontrado = cultivoRepository.findById(guardado.getId());
        assertFalse(encontrado.isPresent());
    }
}
