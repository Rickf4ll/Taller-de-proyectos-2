package com.HospitalRegional.BancoDeLeche.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Apoderado")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Apoderado {

    @Id
    @Column(name = "Id_Apoderado", length = 15)
    private String idApoderado;

    @Column(name = "Parentesco")
    private String parentesco;

    @Column(name = "Nombre_Apoderado", length = 100)
    private String nombreApoderado;

    @Column(name = "Apellido_Paterno_Apoderado", length = 100)
    private String apellidoPaternoApoderado;

    @Column(name = "Apellido_Materno_Apoderado", length = 100)
    private String apellidoMaternoApoderado;

    @ManyToOne
    @JoinColumn(name = "Id_Madre")

    public String getIdApoderado() {
        return idApoderado;
    }

    public void setIdApoderado(String idApoderado) {
        this.idApoderado = idApoderado;
    }

    public String getParentesco() {
        return parentesco;
    }

    public void setParentesco(String parentesco) {
        this.parentesco = parentesco;
    }

    public String getNombreApoderado() {
        return nombreApoderado;
    }

    public void setNombreApoderado(String nombreApoderado) {
        this.nombreApoderado = nombreApoderado;
    }

    public String getApellidoPaternoApoderado() {
        return apellidoPaternoApoderado;
    }

    public void setApellidoPaternoApoderado(String apellidoPaternoApoderado) {
        this.apellidoPaternoApoderado = apellidoPaternoApoderado;
    }

    public String getApellidoMaternoApoderado() {
        return apellidoMaternoApoderado;
    }

    public void setApellidoMaternoApoderado(String apellidoMaternoApoderado) {
        this.apellidoMaternoApoderado = apellidoMaternoApoderado;
    }
}
