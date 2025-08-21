import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PacienteService } from '../services/paciente.service';
import { CunaService } from '../services/cuna.service';
import { TiempoPacienteCunaService } from '../services/tiempopacientecuna.service';
import { Paciente } from '../model/paciente.interface';
import { Cuna } from '../model/cuna.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { TiempoPacienteCuna } from '../model/tiempopacientecuna.interface';
import { CommonModule } from '@angular/common';
import { catchError, filter, of, tap } from 'rxjs';

@Component({
  selector: 'app-buscar-historia-clinica',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './buscar-historia-clinica.component.html',
  styleUrl: './buscar-historia-clinica.component.css'
})
export default class BuscarHistoriaClinicaComponent implements OnInit {
  private pacienteService = inject(PacienteService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  formBusqueda = this.fb.control('', Validators.required);
  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      idPaciente: [''],
      nombrePaciente: [{ value: '', disabled: true }],
      apellidoPaternoPaciente: [{ value: '', disabled: true }],
      apellidoMaternoPaciente: [{ value: '', disabled: true }],
      fechaNacimientoPaciente: [{ value: '', disabled: true }],
      generoPaciente: [{ value: '', disabled: true }],
      dniMadre: [{ value: '', disabled: true }],
      cuna: this.fb.group({
        idCuna: [{ value: '', disabled: true }]
      }),
      diagnosticoPaciente: this.fb.group({
        idDiagnosticoPaciente: [{ value: '', disabled: true }],
        observacionEnfermedad: [{ value: '', disabled: true }]
      })
    });
  }

  buscarPaciente() {
    const input = this.formBusqueda.value?.trim();
    if (!input) {
      alert('Por favor, ingrese un ID de paciente o ID de cuna');
      return;
    }

    const esFormatoCuna = /^([CI]-\d+)$/.test(input);

    if (!esFormatoCuna) {
      this.buscarPorIdPaciente(input);
    } else {
      this.pacienteService.list().pipe(
        catchError(error => {
          console.error('Error al listar pacientes:', error);
          alert('Ocurrió un error al buscar pacientes por cuna.');
          return of([]); // Retornar lista vacía para que no rompa el flujo
        })
      ).subscribe(pacientes => {
        const pacientesConCuna = pacientes.filter(p => p.cuna?.idCuna === input);

        if (pacientesConCuna.length > 0) {
          const pacienteConCuna = pacientesConCuna.sort((a, b) => {
            return new Date(b.fechaNacimientoPaciente).getTime() - new Date(a.fechaNacimientoPaciente).getTime();
          })[0];

          this.form.patchValue(pacienteConCuna);
        } else {
          alert('No se encontró paciente asociado a esa cuna.');
        }
      });
    }
  }

  private buscarPorIdPaciente(idPaciente: string) {
    this.pacienteService.get(idPaciente).pipe(
      catchError(error => {
        if (error.status === 404) {
          alert('Paciente no encontrado en la base de datos.');
        } else {
          alert('Ocurrió un error al buscar el paciente.');
        }
        this.form.reset(); // ← Limpia el formulario si lo deseas
        return of(null);
      }),
      tap(paciente => {
        if (!paciente) {
          console.log('Paciente no encontrado');
        }
      })
    ).subscribe(paciente => {
      if (paciente) {
        this.form.patchValue(paciente);
      }
    });
  }
  

  verHistoria() {
    const idPaciente = this.form.get('idPaciente')?.value;
    if (idPaciente) {
      this.router.navigate(['/ver-historia-clinica', idPaciente]);
    } else {
      alert('No se ha seleccionado un paciente');
    }
  }

  regresar() {
    this.router.navigate(['/menu-historia']);
  }
}

