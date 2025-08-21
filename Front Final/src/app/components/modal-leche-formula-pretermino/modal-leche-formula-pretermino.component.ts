import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { DispensacionService } from '../../services/dispensacion.service';
import { LecheFormulaService } from '../../services/registroFormmula.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-leche-formula-pretermino',
  standalone: true, 
  imports: [
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    CommonModule
  ],
  templateUrl: './modal-leche-formula-pretermino.component.html',
  styleUrls: ['./modal-leche-formula-pretermino.component.css']
})
export class ModalLecheFormulaPreterminoComponent implements OnInit {
  quantity: number = 0;
  leches: any[] = [];
  loading = true;
  code: string = '';

  // Columnas para la tabla
  displayedColumns: string[] = ['codigo', 'kcal'];
  
  constructor(
    public dialogRef: MatDialogRef<ModalLecheFormulaPreterminoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dispensacionService: DispensacionService,
    private formulaService: LecheFormulaService
  ) {
    this.quantity = data.cantidadInicial || 0;
  }

  ngOnInit(): void {
    this.cargarLechesPretermino();
  }

  cargarLechesPretermino() {
    this.dispensacionService.getLecheFormulaPretermino().subscribe({
      next: (data) => {
        this.leches = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando leches pretermino:', error);
        this.loading = false;
        Swal.fire('Error', 'No se pudieron cargar las leches pretermino', 'error');
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

 register() {
  if (!this.code) {
    Swal.fire('Error', 'El código de leche fórmula es requerido', 'error');
    return;
  }

  if (this.quantity <= 0) {
    Swal.fire('Error', 'La cantidad debe ser mayor a cero', 'error');
    return;
  }

  Swal.fire({
    title: '¿Confirmar registro?',
    text: `¿Registrar ${this.quantity}ml de fórmula con código ${this.code}?`,
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
private eliminarLoteYRegistrar() {
  Swal.fire({
    title: 'Verificando lote...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  this.formulaService.eliminarLoteFormula(this.code).subscribe({
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


  private sendDataToBackend() {
    const reporteData = {
      idReportePaciente: this.generateId(),
      lechePasteurizada: 0,
      lecheAutologa: 0,
      ldm: 0,
      lecheFormula: this.quantity,
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