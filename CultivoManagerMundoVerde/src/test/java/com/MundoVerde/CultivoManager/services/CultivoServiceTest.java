package com.MundoVerde.CultivoManager.services;

import com.MundoVerde.CultivoManager.Models.Cultivo;
import com.MundoVerde.CultivoManager.repository.CultivoRepository;
import com.MundoVerde.CultivoManager.service.CultivoService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CultivoServiceTest {

    @Mock
    private CultivoRepository cultivoRepository;

    @InjectMocks
    private CultivoService cultivoService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void obtenerTodos_DeberiaRetornarListaCultivos() {
        Cultivo cultivo1 = new Cultivo();
        cultivo1.setNombre("Tomate");

        Cultivo cultivo2 = new Cultivo();
        cultivo2.setNombre("Maíz");

        when(cultivoRepository.findAll()).thenReturn(List.of(cultivo1, cultivo2));

        List<Cultivo> resultado = cultivoService.obtenerTodos();

        assertEquals(2, resultado.size());
        verify(cultivoRepository, times(1)).findAll();
    }

    @Test
    void guardar_DeberiaGuardarYCultivo() {
        Cultivo cultivo = new Cultivo();
        cultivo.setNombre("Papa");

        when(cultivoRepository.save(cultivo)).thenReturn(cultivo);

        Cultivo resultado = cultivoService.guardar(cultivo);

        assertNotNull(resultado);
        assertEquals("Papa", resultado.getNombre());
        verify(cultivoRepository).save(cultivo);
    }

    @Test
    void obtenerPorId_CultivoExiste() {
        Cultivo cultivo = new Cultivo();
        cultivo.setId(1L);
        cultivo.setNombre("Arroz");

        when(cultivoRepository.findById(1L)).thenReturn(Optional.of(cultivo));

        Cultivo resultado = cultivoService.obtenerPorId(1L);

        assertNotNull(resultado);
        assertEquals("Arroz", resultado.getNombre());
    }

    @Test
    void obtenerPorId_CultivoNoExiste() {
        when(cultivoRepository.findById(999L)).thenReturn(Optional.empty());

        Cultivo resultado = cultivoService.obtenerPorId(999L);

        assertNull(resultado);
    }

    @Test
    void eliminar_DeberiaLlamarDeleteById() {
        cultivoService.eliminar(1L);

        verify(cultivoRepository, times(1)).deleteById(1L);
    }
}
