import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DispensacionService } from '../../services/dispensacion.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-leche-lmd',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule, MatCardModule],
  templateUrl: './modal-leche-lmd.component.html',
  styleUrls: ['./modal-leche-lmd.component.css']
})
export class ModalLecheLMDComponent {
  quantity: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ModalLecheLMDComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dispensacionService: DispensacionService
  ) {
   
    this.quantity = data.cantidadInicial || 0;
  }


  cancel() {
    this.dialogRef.close();
  }

  
  register() {
    
    if (!this.quantity) {
      Swal.fire('Error', 'Por favor complete todos los campos', 'error');
      return;
    }


    Swal.fire({
      title: '¿Confirmar registro?',
      text: `¿Desea registrar ${this.quantity}ml de leche LMD?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.sendDataToBackend();
      }
    });
  }


  private sendDataToBackend() {
   
    Swal.fire({
      title: 'Registrando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    
    const reportData = {
      idReportePaciente: this.generateUniqueId(),
      ldm: this.quantity, 
      lechePasteurizada: 0,
      lecheAutologa: 0,
      lecheFormula: 0,
      paciente: {
        idPaciente: this.data.pacienteId
      }
    };

    this.dispensacionService.registrarLecheLMD(reportData).subscribe({
      next: (response) => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Leche LMD registrada correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.dialogRef.close({
          success: true,
          quantity: this.quantity
        });
      },
      error: (error) => {
        console.error('Error al registrar:', error);
        Swal.fire('Error', 'No se pudo registrar la leche LMD', 'error');
      }
    });
  }

  // Generar ID único para el reporte
  private generateUniqueId(): string {
    return `RP-${Date.now()}`;
  }
}