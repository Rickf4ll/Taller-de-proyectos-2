import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
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
  selector: 'app-modal-pasteurizada-formula',
  imports: [ FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    CommonModule],
  templateUrl: './modal-pasteurizada-formula.component.html',
  styleUrl: './modal-pasteurizada-formula.component.css'
})
export class ModalPasteurizadaFormulaComponent {
  @ViewChild('codeInput') codeInput!: ElementRef;
  code: string = '';
  codef: string ='';
  cantidadPasteurizada: number = 0;
  cantidadF: number = 0;
  quantity: number = 0;
  leches: any[] = [];
  loading = true;
  
  // Columnas para la tabla
  displayedColumns: string[] = ['codigo', 'kcal'];
  constructor(
    public dialogRef: MatDialogRef<ModalPasteurizadaFormulaComponent>,
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
   if (!this.code || !this.codef || this.cantidadPasteurizada <= 0 || this.cantidadF <= 0) {
    Swal.fire('Error', 'Complete todos los campos con valores válidos', 'error');
    return;
  }

    Swal.fire({
      title: '¿Confirmar registro?',
      text: `¿Desea registrar ${this.cantidadPasteurizada}ml de leche autóloga y ${this.cantidadF}ml de leche pasteurizada?`,
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
      lecheAutologa:0,
      lechePasteurizada: this.cantidadPasteurizada,
      lecheFormula:  this.cantidadF,
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

    this.dispensacionService.registrarLechePasteurizadaFormula(reportData).subscribe({
      next: (response: any) => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Leche registrada correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.dialogRef.close({
          success: true,
          cantidadF: this.cantidadF,
          cantidadPasteurizada: this.cantidadPasteurizada,
          type: 'LecheMixta'
        });
      },
      error: (error: any) => {
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

  // 1. Primero eliminar el lote
  this.dispensacionService.eliminarLotePasteurizada(this.code).subscribe({
    next: () => {
      this.sendDataToBackend();
    },
    error: (error) => {
      console.error('Error al eliminar lote:', error);
      
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