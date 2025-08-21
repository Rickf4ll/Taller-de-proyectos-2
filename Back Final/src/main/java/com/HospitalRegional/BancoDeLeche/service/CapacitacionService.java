package com.HospitalRegional.BancoDeLeche.service;

import com.HospitalRegional.BancoDeLeche.entity.Capacitacion;
import com.HospitalRegional.BancoDeLeche.repository.CapacitacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CapacitacionService {

    private final CapacitacionRepository capacitacionRepository;

    public CapacitacionService(CapacitacionRepository capacitacionRepository) {
        this.capacitacionRepository = capacitacionRepository;
    }

    public List<Capacitacion> findAll() {
        return capacitacionRepository.findAll();
    }

    public Optional<Capacitacion> findById(String id) {
        return capacitacionRepository.findById(id);
    }

    public Capacitacion save(Capacitacion capacitacion) {
        return capacitacionRepository.save(capacitacion);
    }

    public void deleteById(String id) {
        capacitacionRepository.deleteById(id);
    }
}
