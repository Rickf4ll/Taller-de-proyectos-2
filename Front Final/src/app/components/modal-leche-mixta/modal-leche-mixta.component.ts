import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { DispensacionService } from '../../services/dispensacion.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-modal-leche-mixta',
  standalone: true,
  imports: [ FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    CommonModule],
  templateUrl: './modal-leche-mixta.component.html',
  styleUrls: ['./modal-leche-mixta.component.css'],
})
export class ModalLecheMixtaComponent {
  @ViewChild('codeInput') codeInput!: ElementRef;
  code: string = '';
  cantidadAutologa: number = 0;
  quantity: number =0;
  cantidadPasteurizada: number = 0;
  constructor(
    public dialogRef: MatDialogRef<ModalLecheMixtaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dispensacionService: DispensacionService
  ) {
     this.quantity = data.cantidadInicial || 0;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.codeInput?.nativeElement) {
        this.codeInput.nativeElement.focus();
      }
    }, 100);
  }
  cancel() { 
    this.dialogRef.close(); 
  }

  register() {
    if (!this.code || this.cantidadAutologa <= 0 || this.cantidadPasteurizada <= 0) {
    Swal.fire('Error', 'Complete todos los campos con valores válidos', 'error');
    return;
  }

    Swal.fire({
      title: '¿Confirmar registro?',
      text: `¿Desea registrar ${this.cantidadAutologa}ml de leche autóloga y ${this.cantidadPasteurizada}ml de leche pasteurizada?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarLoteYRegistrar();
      }
    });
  }

  private sendDataToBackend() {
    // Crear objeto para enviar al backend
    const reportData = {
      idReportePaciente: this.generateId(),
      lecheAutologa: this.cantidadAutologa,       // Campo para leche autóloga
      lechePasteurizada: this.cantidadPasteurizada, // Campo para leche pasteurizada
      lecheFormula: 0,
      ldm: 0,
      paciente: {
        idPaciente: this.data.pacienteId
      }
    };

    // Mostrar loader
    Swal.fire({
      title: 'Registrando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    // Llamar al servicio
    this.dispensacionService.registrarLecheMixta(reportData).subscribe({
      next: (response) => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Leche mixta registrada correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.dialogRef.close({
          success: true,
          code: this.code,
          cantidadAutologa: this.cantidadAutologa,
          cantidadPasteurizada: this.cantidadPasteurizada,
          type: 'LecheMixta'
        });
      },
      error: (error) => {
        console.error('Error al registrar:', error);
        Swal.fire('Error', 'No se pudo registrar la leche mixta', 'error');
      }
    });
  }

  private generateId(): string {
    // Generar ID único para el reporte
    return `RP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
private eliminarLoteYRegistrar() {
  Swal.fire({
    title: 'Verificando lote...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  this.dispensacionService.eliminarLotePasteurizada(this.code).subscribe({
    next: () => {
      this.sendDataToBackend();
    },
    error: (error) => {
      console.error('Error al eliminar lote', error);
      
      let errorMsg = 'Error al eliminar el lote';
      if (error.status === 404) {
        errorMsg = `El lote ${this.code} no existe`;
      } else if (error.status === 400) {
        errorMsg = error.error?.message || 'Datos inválidos';
      }
      
      Swal.fire('Error', errorMsg, 'error');
    }
  });
}

}