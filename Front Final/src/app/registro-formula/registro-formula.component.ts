import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LecheFormulaService } from '../services/registroFormmula.service'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-formula',
  templateUrl: './registro-formula.component.html',
  imports:[FormsModule],
  styleUrls: ['./registro-formula.component.css']
})
export default class RegistroLecheFormulaComponent {
  leche: any = {
    codigoLecheFormula: '', 
    tipoLeche: '',
    cantidadFormula: null,    
    kcal: null
  };

  constructor(
    private lecheService: LecheFormulaService,
    private router: Router
  ) {}

  registrar() {
    if (!this.leche.codigoLecheFormula || 
        !this.leche.tipoLeche || 
        this.leche.cantidadFormula === null || 
        this.leche.kcal === null) {
      Swal.fire({
            icon: 'error',
            title: 'Campos incompletos',
            confirmButtonText: 'Entendido'
          });
      return;
    }

    const registro = {
      codigoLecheFormula: this.leche.codigoLecheFormula,
      tipoLeche: this.leche.tipoLeche,
      cantidadFormula: this.leche.cantidadFormula,
      kcal: this.leche.kcal
    };

    this.lecheService.crearRegistro(registro).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
         Swal.fire({
                title: "Registro exitoso",
                icon: "success",
                draggable: true
              });
        this.resetForm();
      },
      error: (err) => {
        console.error('Error en el registro:', err);
        Swal.fire({
                icon: "error",
                title: "Error en el registro",
                text: "Ocurrió un error al guardar los datos. Por favor intente nuevamente.",
              });
      }
    });
  }

  resetForm() {
    this.leche = {
      codigoLecheFormula: '',
      tipoLeche: '',
      cantidadFormula: null,
      kcal: null
    };
  }

  regresar() {
this.router.navigate(['/menu-almacen']);
  
  }
}