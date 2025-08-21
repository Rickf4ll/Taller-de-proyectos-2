import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteService } from '../services/paciente.service';
import { CunaService } from '../services/cuna.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Paciente } from '../model/paciente.interface';
import { Cuna } from '../model/paciente.interface';

@Component({
  selector: 'app-ver-historia-clinica',
  imports: [CommonModule, FormsModule],
  templateUrl: './ver-historia-clinica.component.html',
  styleUrls: ['./ver-historia-clinica.component.css'],
  standalone: true,
})
export default class VerHistoriaClinicaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pacienteService = inject(PacienteService);
  private cunaService = inject(CunaService);

  paciente: Paciente | null = null;
  nuevaCunaId: string = '';
  detallePeso: string = '';
  detalleEdad: string = '';
  colorDetallePeso: string = '';
  colorDetalleEdad: string = '';

  ngOnInit(): void {
    const idPaciente = this.route.snapshot.paramMap.get('idPaciente');
    if (idPaciente) {
      this.pacienteService.get(idPaciente).subscribe(p => {
        this.paciente = p;
        if (p?.pesoNacimientoPaciente) {
          this.actualizarDetallePeso(p.pesoNacimientoPaciente);
        }
        if (p?.edadGestacionalPaciente) {
          this.actualizarDetalleEdad(p.edadGestacionalPaciente);
        }
      });
    }
  }

  actualizarDetallePeso(peso: number) {
    if (peso >= 4000) {
      this.detallePeso = 'Macrosómico';
      this.colorDetallePeso = 'fondo-negro';
    } else if (peso >= 2500) {
      this.detallePeso = 'Adecuado';
      this.colorDetallePeso = 'fondo-verde';
    } else if (peso >= 1500) {
      this.detallePeso = 'Bajo peso';
      this.colorDetallePeso = 'fondo-rojo';
    } else if (peso >= 1001) {
      this.detallePeso = 'Muy bajo peso';
      this.colorDetallePeso = 'fondo-rojo';
    } else if (peso > 0) {
      this.detallePeso = 'Extremadamente bajo peso al nacer';
      this.colorDetallePeso = 'fondo-rojo';
    }
  }

  actualizarDetalleEdad(edad: number) {
    if (edad >= 42) {
      this.detalleEdad = 'PostTermino';
      this.colorDetalleEdad = 'fondo-negro';
    } else if (edad >= 37) {
      this.detalleEdad = 'Termino';
      this.colorDetalleEdad = 'fondo-verde';
    } else if (edad > 0) {
      this.detalleEdad = 'Pretermino';
      this.colorDetalleEdad = 'fondo-morado';
    }
  }

  actualizarCuna() {
    if (!this.paciente || !this.nuevaCunaId) {
      alert('Completa todos los campos para actualizar la cuna.');
      return;
    }

    const cunaAnterior: Cuna = {
      idCuna: this.paciente.cuna.idCuna,
      estadoCuna: 'Disponible'
    };

    this.cunaService.actualizar(cunaAnterior).subscribe(() => {
      const nuevaCuna: Cuna = {
        idCuna: this.nuevaCunaId,
        estadoCuna: 'No Disponible'
      };

      this.cunaService.actualizar(nuevaCuna).subscribe(() => {
        const actualizado: Paciente = {
          ...this.paciente!,
          cuna: nuevaCuna
        };

        this.pacienteService.update(actualizado.idPaciente, actualizado).subscribe(() => {
          this.paciente = actualizado;
          alert('✅ Cuna actualizada exitosamente.');
        });
      });
    });
  }

  darDeAlta() {
    if (!this.paciente || this.paciente.estado === 'Paciente en alta') {
      alert('El paciente ya está dado de alta o no se ha cargado.');
      return;
    }

    const actualizado: Paciente = {
      ...this.paciente,
      estado: 'Paciente en alta',
      fechaFinal: new Date().toISOString()
    };

    this.pacienteService.update(actualizado.idPaciente, actualizado).subscribe(() => {
      this.paciente = actualizado;

      const cuna: Cuna = {
        idCuna: actualizado.cuna.idCuna,
        estadoCuna: 'Disponible'
      };

      this.cunaService.actualizar(cuna).subscribe(() => {
        alert('Paciente dado de alta y cuna liberada.');
      });
    });
  }

  verActualizarHistoria() {
    this.router.navigate(['/actualizar-historia-clinica', this.paciente?.idPaciente]);
  }
ReportePaciente() {
  this.router.navigate(['reporte-por-paciente',this.paciente?.idPaciente]);
}
  irARegistroMadre() {
    this.router.navigate(['/registro-madre', this.paciente?.idPaciente]);
  }

  regresar() {
    this.router.navigate(['/buscar-historia-clinica']);
  }
  verFoto(){
    
  }
}

