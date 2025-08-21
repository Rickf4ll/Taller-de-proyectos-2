package com.HospitalRegional.BancoDeLeche.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Registro_Formula")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroFormula {

    @Id
    @Column(name = "Codigo_leche_formula", length = 20, nullable = false)
    private String codigoLecheFormula;

    @Column(name = "Tipo_leche", nullable = false, length = 11)
    private String tipoLeche;

    @Column(name = "Cantidad_formula", nullable = false)
    private Float cantidadFormula;

    @Column(name = "Kcal", nullable = false)
    private Float kcal;

    public String getCodigoLecheFormula() {
        return codigoLecheFormula;
    }

    public void setCodigoLecheFormula(String codigoLecheFormula) {
        this.codigoLecheFormula = codigoLecheFormula;
    }

    public String getTipoLeche() {
        return tipoLeche;
    }

    public void setTipoLeche(String tipoLeche) {
        this.tipoLeche = tipoLeche;
    }

    public Float getCantidadFormula() {
        return cantidadFormula;
    }

    public void setCantidadFormula(Float cantidadFormula) {
        this.cantidadFormula = cantidadFormula;
    }

    public Float getKcal() {
        return kcal;
    }

    public void setKcal(Float kcal) {
        this.kcal = kcal;
    }
}