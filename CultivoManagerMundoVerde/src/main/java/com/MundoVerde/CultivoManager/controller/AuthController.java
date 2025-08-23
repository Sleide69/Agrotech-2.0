package com.MundoVerde.CultivoManager.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.MundoVerde.CultivoManager.dto.AuthRequest;
import com.MundoVerde.CultivoManager.dto.RegisterRequest;
import com.MundoVerde.CultivoManager.service.UsuarioService;
import com.MundoVerde.CultivoManager.Models.Usuario;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthRequest authRequest) {
        try {
            // Buscar usuario por email
            Usuario usuario = usuarioService.buscarPorEmail(authRequest.getUsername());
            
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Usuario no encontrado"));
            }

            // Verificar contraseña
            boolean passwordValida = usuarioService.verificarPassword(authRequest.getPassword(), usuario.getPassword());
            
            if (!passwordValida) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Credenciales invalidas"));
            }

            // Login exitoso sin JWT
            return ResponseEntity.ok(Map.of(
                "message", "Login exitoso",
                "user", Map.of(
                    "id", usuario.getId(),
                    "name", usuario.getName(),
                    "email", usuario.getEmail(),
                    "rol", usuario.getRol()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error en el login: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest registerRequest) {
        try {
            // Verificar si el usuario ya existe
            String email = registerRequest.getEmail();
            if (!email.contains("@")) {
                email = email + "@MundoVerde.ec";
            }
            
            Usuario usuarioExistente = usuarioService.buscarPorEmail(email);
            if (usuarioExistente != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "El usuario ya existe"));
            }

            // Crear nuevo usuario
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setName(registerRequest.getName());
            nuevoUsuario.setEmail(registerRequest.getEmail());
            nuevoUsuario.setPassword(registerRequest.getPassword());
            nuevoUsuario.setRol(registerRequest.getRol() != null ? registerRequest.getRol() : "USER");

            Usuario usuarioCreado = usuarioService.crearUsuario(nuevoUsuario);

            // Registro exitoso sin JWT
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Usuario registrado exitosamente",
                "user", Map.of(
                    "id", usuarioCreado.getId(),
                    "name", usuarioCreado.getName(),
                    "email", usuarioCreado.getEmail(),
                    "rol", usuarioCreado.getRol()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al crear usuario: " + e.getMessage()));
        }
    }

}
