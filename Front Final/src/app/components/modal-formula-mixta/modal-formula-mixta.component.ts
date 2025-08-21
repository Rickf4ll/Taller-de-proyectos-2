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
  selector: 'app-modal-formula-mixta',
  standalone: true,
  imports: [ FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    CommonModule],
  templateUrl: './modal-formula-mixta.component.html',
  styleUrls: ['./modal-formula-mixta.component.css'],
})
export class ModalFormulaMixtaComponent {
  @ViewChild('codigoInput') codigoInput!: ElementRef;
    quantity: number = 0;
  cantidadLeche: number = 0;
  cantidadFormula: number = 0;
  leches: any[] = [];
  loading = true;
  displayedColumns: string[] = ['codigo', 'kcal'];

  constructor(
    public dialogRef: MatDialogRef<ModalFormulaMixtaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dispensacionService: DispensacionService
  ) {
       this.quantity = data.cantidadInicial || 0;

  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.codigoInput?.nativeElement) {
        this.codigoInput.nativeElement.focus();
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
    // Validar campos
    if ( this.cantidadLeche <= 0 || this.cantidadFormula <= 0) {
      Swal.fire('Error', 'Complete todos los campos con valores válidos', 'error');
      return;
    }

    // Mostrar confirmación
    Swal.fire({
      title: '¿Confirmar registro?',
      text: `¿Desea registrar ${this.cantidadLeche}ml de leche autóloga y ${this.cantidadFormula}ml de fórmula?`,
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
    // Crear objeto para enviar al backend
    const reportData = {
      idReportePaciente: this.generateId(),
      lecheAutologa: this.cantidadLeche,  // Campo para leche autóloga
      lecheFormula: this.cantidadFormula,  // Campo para fórmula
      lechePasteurizada: 0,
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
    this.dispensacionService.registrarFormulaMixta(reportData).subscribe({
      next: (response) => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Fórmula mixta registrada correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.dialogRef.close({
          success: true,
          cantidadLeche: this.cantidadLeche,
          cantidadFormula: this.cantidadFormula,
          type: 'FormulaMixta'
        });
      },
      error: (error) => {
        console.error('Error al registrar:', error);
        Swal.fire('Error', 'No se pudo registrar la fórmula mixta', 'error');
      }
    });
  }

  private generateId(): string {
    // Generar ID único para el reporte
    return `RP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}