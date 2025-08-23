
package com.MundoVerde.CultivoManager.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.MundoVerde.CultivoManager.Models.Cultivo;
import com.MundoVerde.CultivoManager.service.CultivoService;

import java.util.List;
@RestController
@RequestMapping("/api/cultivos")
public class CultivoController {

    private final CultivoService cultivoService;

    public CultivoController(CultivoService cultivoService) {
        this.cultivoService = cultivoService;
    }

    @GetMapping
    public List<Cultivo> obtenerTodos() {
        return cultivoService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cultivo> obtenerPorId(@PathVariable Long id) {
        Cultivo cultivo = cultivoService.obtenerPorId(id);
        if (cultivo == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(cultivo);
    }


    @PostMapping
    public Cultivo crearCultivo(@RequestBody Cultivo cultivo) {
        return cultivoService.guardar(cultivo);
    }

    @PutMapping("/{id}")
    public Cultivo actualizarCultivo(@PathVariable Long id, @RequestBody Cultivo cultivoActualizado) {
        Cultivo cultivoExistente = cultivoService.obtenerPorId(id);

        cultivoExistente.setNombre(cultivoActualizado.getNombre());
        cultivoExistente.setTipoPlanta(cultivoActualizado.getTipoPlanta());
        cultivoExistente.setFechaSiembra(cultivoActualizado.getFechaSiembra());
        return cultivoService.guardar(cultivoExistente);
    }


   @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCultivo(@PathVariable Long id) {
        cultivoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

}
















//Controladores para uso de frontend con Thymeleaf
// @Controller
// @RequestMapping("/cultivos")
// public class CultivoController {

//     private final CultivoService cultivoService;

//     public CultivoController(CultivoService cultivoService) {
//         this.cultivoService = cultivoService;
//     }

//     @GetMapping("/lista")
//     public String listarCultivos(Model model) {
//         List<Cultivo> cultivos = cultivoService.obtenerTodos();
//         model.addAttribute("cultivos", cultivos);
//         return "lista-cultivos";
//     }

//     @GetMapping("/nuevo")
//     public String mostrarFormulario(Model model) {
//         model.addAttribute("cultivo", new Cultivo());
//         return "formularioCultivo"; // Corresponde al archivo formularioCultivo.html en templates
//     }

//     @PostMapping("/guardar")
//     public String guardarCultivo(@ModelAttribute Cultivo cultivo) {
//         cultivoService.guardar(cultivo);
//         return "redirect:/cultivos/lista";
//     }

//     @GetMapping("/eliminar/{id}")
//     public String eliminarCultivo(@PathVariable Long id) {
//         cultivoService.eliminar(id);
//         return "redirect:/cultivos/lista";
//     }
//}