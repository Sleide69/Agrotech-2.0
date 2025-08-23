package com.MundoVerde.CultivoManager.controllers;

import com.MundoVerde.CultivoManager.Models.Usuario;
import com.MundoVerde.CultivoManager.controller.UsuarioController;
import com.MundoVerde.CultivoManager.service.UsuarioService;
import com.MundoVerde.CultivoManager.service.JwtService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UsuarioController.class)
@AutoConfigureMockMvc(addFilters = false)
public class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UsuarioService usuarioService;

    @MockitoBean
    private JwtService jwtService;  
    
    @Test
    void crearUsuario_Retorna201() throws Exception {
        Usuario usuarioMock = new Usuario();
        usuarioMock.setId(1L);
        usuarioMock.setEmail("usuario@MundoVerde.ec");
        usuarioMock.setName("Test User");
        usuarioMock.setRol("USER");

        when(usuarioService.crearUsuario(any(Usuario.class))).thenReturn(usuarioMock);

        String jsonRequest = """
            {
                "email": "usuario@example.com",
                "name": "Test User",
                "password": "123456",
                "rol": "USER"
            }
            """;

        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonRequest))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.email").value("usuario@MundoVerde.ec"))
            .andExpect(jsonPath("$.name").value("Test User"))
            .andExpect(jsonPath("$.rol").value("USER"));
    }

    @Test
    void obtenerUsuarioPorEmail_RetornaUsuario() throws Exception {
        Usuario usuarioMock = new Usuario();
        usuarioMock.setId(1L);
        usuarioMock.setEmail("usuario@MundoVerde.ec");
        usuarioMock.setName("Test User");
        usuarioMock.setRol("USER");

        when(usuarioService.buscarPorEmail("usuario@MundoVerde.ec")).thenReturn(usuarioMock);

        mockMvc.perform(get("/api/usuarios/usuario@MundoVerde.ec"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("usuario@MundoVerde.ec"))
            .andExpect(jsonPath("$.name").value("Test User"))
            .andExpect(jsonPath("$.rol").value("USER"));
    }

    @Test
    void obtenerUsuarioPorEmail_NoEncontrado() throws Exception {
        when(usuarioService.buscarPorEmail("noexiste@MundoVerde.ec")).thenReturn(null);

        mockMvc.perform(get("/api/usuarios/noexiste@MundoVerde.ec"))
            .andExpect(status().isNotFound());
    }
}
