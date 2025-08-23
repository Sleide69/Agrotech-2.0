package com.MundoVerde.CultivoManager.controller;

import com.MundoVerde.CultivoManager.Models.Riego;
import com.MundoVerde.CultivoManager.service.RiegoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/riegos")
public class RiegoController {

    private final RiegoService riegoService;

    public RiegoController(RiegoService riegoService) {
        this.riegoService = riegoService;
    }

    @GetMapping
    public List<Riego> getAll() {
        return riegoService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Riego> getById(@PathVariable Long id) {
        return riegoService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Riego create(@RequestBody Riego riego) {
        return riegoService.save(riego);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Riego> update(@PathVariable Long id, @RequestBody Riego riego) {
        return riegoService.getById(id)
                .map(existing -> {
                    riego.setId(id);
                    return ResponseEntity.ok(riegoService.save(riego));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (riegoService.getById(id).isPresent()) {
            riegoService.delete(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
