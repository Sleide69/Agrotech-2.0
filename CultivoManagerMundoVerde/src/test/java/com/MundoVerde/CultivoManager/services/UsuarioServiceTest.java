package com.MundoVerde.CultivoManager.services;

import com.MundoVerde.CultivoManager.service.UsuarioService;
import com.MundoVerde.CultivoManager.Models.Usuario;
import com.MundoVerde.CultivoManager.repository.UsuarioRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Optional;


import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

public class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
        void crearUsuario_DeberiaTransformarEmailYGuardar() {
            Usuario input = new Usuario();
            input.setEmail("usuario@example.com");
            input.setName("Test User");
            input.setRol("USER");
            input.setPassword("123456");
        
            Usuario saved = new Usuario();
            saved.setId(1L);
            saved.setEmail("usuario@MundoVerde.ec");
            saved.setName("Test User");
            saved.setRol("USER");
            saved.setPassword("hashed"); 
        
            when(usuarioRepository.save(any(Usuario.class))).thenReturn(saved);
        
            Usuario resultado = usuarioService.crearUsuario(input);
        
            assertEquals("usuario@MundoVerde.ec", resultado.getEmail());
            assertEquals("Test User", resultado.getName());
            assertEquals("USER", resultado.getRol());
            assertNotNull(resultado.getId());
    }


    @Test
    void buscarPorEmail_UsuarioExiste() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("usuario@MundoVerde.ec");
        usuario.setName("Test User");
        usuario.setRol("USER");

        when(usuarioRepository.findByEmail("usuario@MundoVerde.ec")).thenReturn(java.util.Optional.of(usuario));

        Usuario resultado = usuarioService.buscarPorEmail("usuario@MundoVerde.ec");

        assertNotNull(resultado);
        assertEquals("usuario@MundoVerde.ec", resultado.getEmail());
        assertEquals("Test User", resultado.getName());
    }

    @Test
    void buscarPorEmail_UsuarioNoExiste() {
        when(usuarioRepository.findByEmail("noexiste@MundoVerde.ec")).thenReturn(Optional.empty());

        Usuario resultado = usuarioService.buscarPorEmail("noexiste@MundoVerde.ec");

        assertNull(resultado);
    }
}
