package com.MundoVerde.CultivoManager.controllers;

import com.MundoVerde.CultivoManager.Models.Cultivo;
import com.MundoVerde.CultivoManager.controller.CultivoController;
import com.MundoVerde.CultivoManager.service.CultivoService;
import com.MundoVerde.CultivoManager.service.JwtService;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(CultivoController.class)
@AutoConfigureMockMvc(addFilters = false)
public class CultivoControllerTest {

   @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CultivoService cultivoService;

    @MockitoBean
    private JwtService jwtService; 

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Test
    void obtenerTodosTest() throws Exception {
        Cultivo c1 = new Cultivo();
        c1.setNombre("Maíz");
        Cultivo c2 = new Cultivo();
        c2.setNombre("Café");

        when(cultivoService.obtenerTodos()).thenReturn(List.of(c1, c2));

        mockMvc.perform(get("/api/cultivos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    public void guardarCultivoTest() throws Exception {
        Cultivo cultivo = new Cultivo();
        cultivo.setNombre("Maíz");
        cultivo.setTipoPlanta("Cereal");
        cultivo.setFechaSiembra(LocalDate.of(2025, 6, 8));

        // Simula la respuesta del servicio
        when(cultivoService.guardar(any(Cultivo.class))).thenReturn(cultivo);

        String json = objectMapper.writeValueAsString(cultivo);

        mockMvc.perform(post("/api/cultivos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk()); 
    }


    @Test
    void obtenerPorIdTest() throws Exception {
        Cultivo cultivo = new Cultivo();
        cultivo.setId(1L);
        cultivo.setNombre("Soya");

        when(cultivoService.obtenerPorId(1L)).thenReturn(cultivo);

        mockMvc.perform(get("/api/cultivos/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nombre").value("Soya"));
    }

    @Test
    void obtenerPorIdNoExiste() throws Exception {
        when(cultivoService.obtenerPorId(999L)).thenReturn(null);

        mockMvc.perform(get("/api/cultivos/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void eliminarTest() throws Exception {
        doNothing().when(cultivoService).eliminar(1L);

        mockMvc.perform(delete("/api/cultivos/1"))
            .andExpect(status().isNoContent());
    }
}
