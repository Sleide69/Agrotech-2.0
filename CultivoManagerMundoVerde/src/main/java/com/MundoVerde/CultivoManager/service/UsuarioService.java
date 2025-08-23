package com.MundoVerde.CultivoManager.service;

import org.springframework.stereotype.Service;

import com.MundoVerde.CultivoManager.Models.Usuario;
import com.MundoVerde.CultivoManager.repository.UsuarioRepository;

import java.util.List;
//importacion para la incriptacion de la contraseña
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;


@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = new BCryptPasswordEncoder(); 
    }

    public Usuario crearUsuario(Usuario usuario) {
        String passwordHasheada = passwordEncoder.encode(usuario.getPassword());
        usuario.setPassword(passwordHasheada);


        String emailSinDominio = usuario.getEmail();
        if (emailSinDominio.contains("@")) {
            emailSinDominio = emailSinDominio.substring(0, emailSinDominio.indexOf("@"));
        }
        usuario.setEmail(emailSinDominio + "@MundoVerde.ec");

        return usuarioRepository.save(usuario);
    }
        
    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }

    public boolean verificarPassword(String passwordIngresada, String hashAlmacenado) {
        return passwordEncoder.matches(passwordIngresada, hashAlmacenado);
    }
    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email).orElse(null);
    }


}
