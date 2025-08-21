package com.HospitalRegional.BancoDeLeche.controller;

import com.HospitalRegional.BancoDeLeche.entity.Apoderado;
import com.HospitalRegional.BancoDeLeche.service.ApoderadoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/apoderados")
public class ApoderadoController {

    private final ApoderadoService apoderadoService;

    public ApoderadoController(ApoderadoService apoderadoService) {
        this.apoderadoService = apoderadoService;
    }

    @GetMapping
    public List<Apoderado> getAllApoderados() {
        return apoderadoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Apoderado> getApoderadoById(@PathVariable String id) {
        Optional<Apoderado> apoderado = apoderadoService.findById(id);
        return apoderado.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Apoderado createApoderado(@RequestBody Apoderado apoderado) {
        return apoderadoService.save(apoderado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Apoderado> updateApoderado(@PathVariable String id, @RequestBody Apoderado apoderado) {
        if (!apoderadoService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        apoderado.setIdApoderado(id); // Asegura que el ID no cambie
        return ResponseEntity.ok(apoderadoService.save(apoderado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApoderado(@PathVariable String id) {
        if (!apoderadoService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        apoderadoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
