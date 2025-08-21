package com.HospitalRegional.BancoDeLeche.repository;

import com.HospitalRegional.BancoDeLeche.entity.ReportePaciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportePacienteRepository extends JpaRepository<ReportePaciente, String> {
}
