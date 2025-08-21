package com.HospitalRegional.BancoDeLeche.controller;

import com.HospitalRegional.BancoDeLeche.entity.Madre;
import com.HospitalRegional.BancoDeLeche.service.MadreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/madres")
public class MadreController {

    @Autowired
    private MadreService madreService;

    @GetMapping
    public List<Madre> getAllMadres() {
        return madreService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Madre> getMadreById(@PathVariable String id) {
        Optional<Madre> madre = madreService.findById(id);
        return madre.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Madre createMadre(@RequestBody Madre madre) {
        return madreService.save(madre);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Madre> updateMadre(@PathVariable String id, @RequestBody Madre madre) {
        if (!madreService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        madre.setIdMadre(id); // Asegura que el ID se mantenga
        return ResponseEntity.ok(madreService.save(madre));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMadre(@PathVariable String id) {
        if (!madreService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        madreService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
