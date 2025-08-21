package com.HospitalRegional.BancoDeLeche.controller;

import com.HospitalRegional.BancoDeLeche.entity.Donadora;
import com.HospitalRegional.BancoDeLeche.service.DonadoraService;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/donadoras")
public class DonadoraController {

    private final DonadoraService donadoraService;

    public DonadoraController(DonadoraService donadoraService) {
        this.donadoraService = donadoraService;
    }

    @GetMapping
    public List<Donadora> getAllDonadoras() {
        return donadoraService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Donadora> getDonadoraById(@PathVariable String id) {
        Optional<Donadora> donadora = donadoraService.findById(id);
        return donadora.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Donadora createDonadora(@RequestBody Donadora donadora) {
        return donadoraService.save(donadora);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Donadora> updateDonadora(
            @PathVariable String id,
            @Validated @ModelAttribute Donadora donadora, // Cambiar de @RequestBody a @ModelAttribute
            @RequestParam(value = "consentimiento", required = false) MultipartFile file) {

        Optional<Donadora> donadoraOptional = donadoraService.findById(id);

        if (!donadoraOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Donadora donadoraExistente = donadoraOptional.get();

        try {
            // Actualizar campos
            BeanUtils.copyProperties(donadora, donadoraExistente,
                    "idDonadora", "consentimientoDonadora");

            if (file != null && !file.isEmpty()) {
                donadoraExistente.setConsentimientoDonadora(file.getBytes());
            }

            return ResponseEntity.ok(donadoraService.save(donadoraExistente));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonadora(@PathVariable String id) {
        if (donadoraService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        donadoraService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
