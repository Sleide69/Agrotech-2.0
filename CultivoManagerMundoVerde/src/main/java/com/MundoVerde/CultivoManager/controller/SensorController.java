package com.MundoVerde.CultivoManager.controller;

import com.MundoVerde.CultivoManager.Models.Sensor;
import com.MundoVerde.CultivoManager.service.SensorService;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sensores")
public class SensorController {

    private final SensorService sensorService;
    private final JdbcTemplate jdbcTemplate;

    public SensorController(SensorService sensorService, JdbcTemplate jdbcTemplate) {
        this.sensorService = sensorService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<Sensor> getAll() {
        return sensorService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sensor> getById(@PathVariable Long id) {
        return sensorService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Sensor create(@RequestBody Sensor sensor) {
        return sensorService.save(sensor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sensor> update(@PathVariable Long id, @RequestBody Sensor sensor) {
        return sensorService.getById(id)
                .map(existing -> {
                    sensor.setId(id);
                    return ResponseEntity.ok(sensorService.save(sensor));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (sensorService.getById(id).isPresent()) {
            sensorService.delete(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Últimas lecturas por sensor y métrica
    @GetMapping("/{id}/ultimas-lecturas")
    public ResponseEntity<?> ultimasLecturas(@PathVariable Long id,
                                             @RequestParam(defaultValue = "humedad") String metric,
                                             @RequestParam(defaultValue = "100") int limit) {
        String sql = "select ts, metric, value, metadata from telemetry.lecturas where sensor_id=? and metric=? order by ts desc limit ?";
        var rows = jdbcTemplate.queryForList(sql, id, metric, limit);
        return ResponseEntity.ok(rows);
    }
}
