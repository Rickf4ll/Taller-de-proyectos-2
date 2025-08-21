package com.HospitalRegional.BancoDeLeche.controller;

import com.HospitalRegional.BancoDeLeche.entity.DiagnosticoPaciente;
import com.HospitalRegional.BancoDeLeche.service.DiagnosticoPacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/diagnosticos")
public class DiagnosticoPacienteController {

    @Autowired
    private DiagnosticoPacienteService diagnosticoPacienteService;

    @GetMapping
    public List<DiagnosticoPaciente> getAllDiagnosticos() {
        return diagnosticoPacienteService.findAll();
    }

    @GetMapping("/{id}")
    public Optional<DiagnosticoPaciente> getDiagnosticoById(@PathVariable String id) {
        return diagnosticoPacienteService.findById(id);
    }

    @PostMapping
    public DiagnosticoPaciente createDiagnostico(@RequestBody DiagnosticoPaciente diagnosticoPaciente) {
        return diagnosticoPacienteService.save(diagnosticoPaciente);
    }

    @PutMapping
    public DiagnosticoPaciente updateDiagnostico(@RequestBody DiagnosticoPaciente diagnosticoPaciente) {
        return diagnosticoPacienteService.save(diagnosticoPaciente);
    }

    @DeleteMapping("/{id}")
    public void deleteDiagnostico(@PathVariable String id) {
        diagnosticoPacienteService.deleteById(id);
    }
}
