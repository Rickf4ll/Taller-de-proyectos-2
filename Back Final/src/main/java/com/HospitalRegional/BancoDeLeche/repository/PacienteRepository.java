package com.HospitalRegional.BancoDeLeche.repository;

import com.HospitalRegional.BancoDeLeche.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; // Importar List si aún no está

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, String> {
    // Spring Data JPA implementa este método automáticamente
    // para encontrar pacientes donde el campo 'estado' coincide con el valor proporcionado
    List<Paciente> findByEstado(String estado);

    // Los métodos CRUD básicos (save, findById, findAll, deleteById, etc.)
    // siguen disponibles gracias a JpaRepository
}