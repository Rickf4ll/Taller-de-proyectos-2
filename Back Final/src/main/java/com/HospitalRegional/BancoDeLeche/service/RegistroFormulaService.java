package com.HospitalRegional.BancoDeLeche.service;

import com.HospitalRegional.BancoDeLeche.entity.RegistroFormula;
import com.HospitalRegional.BancoDeLeche.entity.RegistroLechePasteurizada;
import com.HospitalRegional.BancoDeLeche.repository.RegistroFormulaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RegistroFormulaService {

    private final RegistroFormulaRepository registroFormulaRepository;

    public RegistroFormulaService(RegistroFormulaRepository registroFormulaRepository) {
        this.registroFormulaRepository = registroFormulaRepository;
    }

    public Optional<RegistroFormula> findByCodigo(String codigoLecheFormula) {
        return registroFormulaRepository.findById(codigoLecheFormula);
    }
    public Optional<RegistroFormula> findById(String id) {
        return registroFormulaRepository.findById(id);
    }

    public List<RegistroFormula> findAll() {
        return registroFormulaRepository.findAll();
    }

    public RegistroFormula save(RegistroFormula registroFormula) {
        return registroFormulaRepository.save(registroFormula);
    }

    public void deleteById(String id) {
        registroFormulaRepository.deleteById(id);
    }
}