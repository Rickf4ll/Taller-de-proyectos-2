package com.HospitalRegional.BancoDeLeche.repository;

import com.HospitalRegional.BancoDeLeche.entity.Capacitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CapacitacionRepository extends JpaRepository<Capacitacion, String> {
}
