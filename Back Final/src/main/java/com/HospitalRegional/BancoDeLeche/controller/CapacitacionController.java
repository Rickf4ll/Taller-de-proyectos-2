package com.HospitalRegional.BancoDeLeche.controller;

import com.HospitalRegional.BancoDeLeche.entity.Capacitacion;
import com.HospitalRegional.BancoDeLeche.service.CapacitacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/capacitaciones")
public class CapacitacionController {

    private final CapacitacionService capacitacionService;

    public CapacitacionController(CapacitacionService capacitacionService) {
        this.capacitacionService = capacitacionService;
    }

    @GetMapping
    public List<Capacitacion> getAllCapacitaciones() {
        return capacitacionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Capacitacion> getCapacitacionById(@PathVariable String id) {
        Optional<Capacitacion> capacitacion = capacitacionService.findById(id);
        return capacitacion.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Capacitacion createCapacitacion(@RequestBody Capacitacion capacitacion) {
        return capacitacionService.save(capacitacion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Capacitacion> updateCapacitacion(@PathVariable String id, @RequestBody Capacitacion capacitacion) {
        if (!capacitacionService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        capacitacion.setIdCapacitacion(id); // Asegura que el ID no cambie
        return ResponseEntity.ok(capacitacionService.save(capacitacion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCapacitacion(@PathVariable String id) {
        if (!capacitacionService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        capacitacionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
