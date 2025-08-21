package com.HospitalRegional.BancoDeLeche.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Capacitacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Capacitacion {

    @Id
    @Column(name = "Id_Capacitacion", length = 20)
    private String idCapacitacion;

    @ManyToOne
    @JoinColumn(name = "Id_Madre")
    private Madre madre;

    @Column(name = "Higiene_de_Manos")
    private String higieneDeManos;

    @Column(name = "Tecnica_de_Lactancia_Materna")
    private String tecnicaDeLactanciaMaterna;

    @Column(name = "Higiene_de_Mamas")
    private String higieneDeMamas;

    @Column(name = "Tecnica_de_Extraccion_de_Leche_Extrahospitalaria")
    private String tecnicaExtrahospitalaria;

    @Column(name = "Tecnica_de_Extraccion_de_Leche_Intrahospitalaria")
    private String tecnicaIntrahospitalaria;

    @Column(name = "Masaje_de_Mamas")
    private String masajeDeMamas;

    @Column(name = "Lavado_de_Mamas")
    private String lavadoDeMamas;

    public String getIdCapacitacion() {
        return idCapacitacion;
    }

    public void setIdCapacitacion(String idCapacitacion) {
        this.idCapacitacion = idCapacitacion;
    }

    public Madre getMadre() {
        return madre;
    }

    public void setMadre(Madre madre) {
        this.madre = madre;
    }

    public String getHigieneDeManos() {
        return higieneDeManos;
    }

    public void setHigieneDeManos(String higieneDeManos) {
        this.higieneDeManos = higieneDeManos;
    }

    public String getHigieneDeMamas() {
        return higieneDeMamas;
    }

    public void setHigieneDeMamas(String higieneDeMamas) {
        this.higieneDeMamas = higieneDeMamas;
    }

    public String getTecnicaDeLactanciaMaterna() {
        return tecnicaDeLactanciaMaterna;
    }

    public void setTecnicaDeLactanciaMaterna(String tecnicaDeLactanciaMaterna) {
        this.tecnicaDeLactanciaMaterna = tecnicaDeLactanciaMaterna;
    }

    public String getTecnicaExtrahospitalaria() {
        return tecnicaExtrahospitalaria;
    }

    public void setTecnicaExtrahospitalaria(String tecnicaExtrahospitalaria) {
        this.tecnicaExtrahospitalaria = tecnicaExtrahospitalaria;
    }

    public String getTecnicaIntrahospitalaria() {
        return tecnicaIntrahospitalaria;
    }

    public void setTecnicaIntrahospitalaria(String tecnicaIntrahospitalaria) {
        this.tecnicaIntrahospitalaria = tecnicaIntrahospitalaria;
    }

    public String getMasajeDeMamas() {
        return masajeDeMamas;
    }

    public void setMasajeDeMamas(String masajeDeMamas) {
        this.masajeDeMamas = masajeDeMamas;
    }

    public String getLavadoDeMamas() {
        return lavadoDeMamas;
    }

    public void setLavadoDeMamas(String lavadoDeMamas) {
        this.lavadoDeMamas = lavadoDeMamas;
    }
}
