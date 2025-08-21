package com.HospitalRegional.BancoDeLeche.service;

import com.HospitalRegional.BancoDeLeche.entity.Apoderado;
import com.HospitalRegional.BancoDeLeche.repository.ApoderadoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ApoderadoService {

    private final ApoderadoRepository apoderadoRepository;

    public ApoderadoService(ApoderadoRepository apoderadoRepository) {
        this.apoderadoRepository = apoderadoRepository;
    }

    public List<Apoderado> findAll() {
        return apoderadoRepository.findAll();
    }

    public Optional<Apoderado> findById(String id) {
        return apoderadoRepository.findById(id);
    }

    public Apoderado save(Apoderado apoderado) {
        return apoderadoRepository.save(apoderado);
    }

    public void deleteById(String id) {
        apoderadoRepository.deleteById(id);
    }
}
