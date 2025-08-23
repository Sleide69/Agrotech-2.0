package com.MundoVerde.CultivoManager.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.MundoVerde.CultivoManager.Models.Usuario;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test") 
class UsuarioRepositoryTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void guardarYBuscarUsuarioPorEmail() {
        // Arrange
        Usuario usuario = new Usuario();
        usuario.setName("Juan");
        usuario.setEmail("juan@mail.com");
        usuario.setPassword("1234");

        // Act
        usuarioRepository.save(usuario);
        Optional<Usuario> resultado = usuarioRepository.findByEmail("juan@mail.com");

        // Assert
        assertTrue(resultado.isPresent());
        assertEquals("Juan", resultado.get().getName());
    }
}
