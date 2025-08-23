package com.MundoVerde.CultivoManager.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// import org.springframework.stereotype.Controller;
// import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import com.MundoVerde.CultivoManager.Models.Usuario;
import com.MundoVerde.CultivoManager.service.UsuarioService;

import java.util.List;


@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioService.obtenerTodos();
    }

    @GetMapping("/{email}")
    public ResponseEntity<Usuario> getUsuarioPorEmail(@PathVariable String email) {
        Usuario usuario = usuarioService.buscarPorEmail(email);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(usuario);
    }


    @PostMapping
    // public Usuario crearUsuario(@RequestBody Usuario usuario) {
    //     return usuarioService.crearUsuario(usuario);
    // }
    public ResponseEntity<Usuario> crearUsuario(@RequestBody Usuario usuario) {
       Usuario creado = usuarioService.crearUsuario(usuario);
       return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @DeleteMapping("/{id}")
    public void eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminar(id);
    }

    
}



//  CODIGO PARA RUTAS CON FRONT 


// @Controller
// @RequestMapping("/usuarios")
// public class UsuarioController {

//     private final UsuarioService usuarioService;

//     public UsuarioController(UsuarioService usuarioService) {
//         this.usuarioService = usuarioService;
//     }

//     @GetMapping("/lista")
//     public String listarUsuarios(Model model) {
//         List<Usuario> usuarios = usuarioService.obtenerTodos();
//         model.addAttribute("usuarios", usuarios);
//         return "lista-usuarios"; // Tu archivo HTML debe llamarse lista-usuarios.html
//     }

//     @GetMapping("/nuevo")
//     public String registrarUsuario(Model model) {
//         model.addAttribute("usuario", new Usuario());
//         return "register-usuario"; // Tu archivo HTML debe llamarse register-usuario.html
//     }

//     @PostMapping("/guardar")
//     public String guardarUsuario(@ModelAttribute Usuario usuario) {
//         usuarioService.guardar(usuario);
//         return "redirect:/usuarios/lista";
//     }

//     @GetMapping("/eliminar/{id}")
//     public String eliminarUsuario(@PathVariable Long id) {
//         usuarioService.eliminar(id);
//         return "redirect:/usuarios/lista";
//     }
