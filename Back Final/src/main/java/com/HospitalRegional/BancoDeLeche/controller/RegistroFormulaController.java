package com.HospitalRegional.BancoDeLeche.controller;

import com.HospitalRegional.BancoDeLeche.entity.RegistroFormula;
import com.HospitalRegional.BancoDeLeche.service.RegistroFormulaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
@RestController
@CrossOrigin
@RequestMapping("/registrosFormula")
public class RegistroFormulaController {

    private final RegistroFormulaService service;

    @Autowired
    public RegistroFormulaController(RegistroFormulaService service) {
        this.service = service;
    }

    @GetMapping
    public List<RegistroFormula> obtenerTodos() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistroFormula> getRegistroById(@PathVariable String id) {
        Optional<RegistroFormula> registro = service.findByCodigo(id);
        return registro.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public RegistroFormula crear(@RequestBody RegistroFormula registro) {
        return service.save(registro);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable String id) {
        service.deleteById(id);
    }
}