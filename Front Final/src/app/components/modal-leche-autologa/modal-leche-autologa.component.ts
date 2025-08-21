import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { ModalLechePasteurizadaComponent } from '../modal-leche-pasteurizada/modal-leche-pasteurizada.component';
import { DispensacionService } from '../../services/dispensacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-leche-autologa',
  imports: [FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule],
  templateUrl: './modal-leche-autologa.component.html',
  styleUrl: './modal-leche-autologa.component.css'
})
export class ModalLecheAutologaComponent {
quantity: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ModalLechePasteurizadaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dispensacionService: DispensacionService
  ) {
    this.quantity = data.cantidadInicial || 0;
  }

  cancel() {
    this.dialogRef.close();
  }

  register() {
    if (this.quantity <= 0) {
      Swal.fire('Error', 'La cantidad debe ser mayor a cero', 'error');
      return;
    }

    Swal.fire({
      title: '¿Confirmar registro?',
      text: `¿Registrar ${this.quantity}ml de leche con código de leche autologa?`,
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
    const reporteData = {
      idReportePaciente: this.generateId(),
      lechePasteurizada: 0,
      lecheAutologa: this.quantity,
      ldm: 0,
      lecheFormula: 0,
      paciente: {
        idPaciente: this.data.pacienteId
      }
    };

    Swal.fire({
      title: 'Registrando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.dispensacionService.registrarLechePasteurizada(reporteData).subscribe({
      next: (response) => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Leche registrada correctamente',
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
        Swal.fire('Error', 'No se pudo registrar la leche', 'error');
      }
    });
  }

  private generateId(): string {
    return `RP-${Date.now()}`;
  }
}
