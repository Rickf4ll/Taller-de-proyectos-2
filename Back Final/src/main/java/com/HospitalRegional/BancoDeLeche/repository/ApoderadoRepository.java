package com.HospitalRegional.BancoDeLeche.repository;

import com.HospitalRegional.BancoDeLeche.entity.Apoderado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApoderadoRepository extends JpaRepository<Apoderado, String> {
}
