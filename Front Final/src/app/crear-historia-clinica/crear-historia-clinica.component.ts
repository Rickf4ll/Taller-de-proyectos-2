import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { PacienteService } from '../services/paciente.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CunaService } from '../services/cuna.service';
import { CommonModule } from '@angular/common';
import { Paciente } from '../model/paciente.interface';
import { Cuna } from '../model/cuna.interface'; // o el archivo correcto donde declaraste tu versión básica
import { DiagnosticoPacienteService } from '../services/diagnosticopaciente.service';
import { ValidatorFn } from '@angular/forms';
import { DiagnosticoPaciente } from '../model/madre.interface';


@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  selector: 'app-crear-historia-clinica',
  templateUrl: './crear-historia-clinica.component.html',
  styleUrls: ['./crear-historia-clinica.component.css']
})

export default class CrearHistoriaClinicaComponent implements OnInit {
  private pacienteService = inject(PacienteService);
  private cunaService = inject(CunaService);
  private diagnosticoPacienteService = inject(DiagnosticoPacienteService);
  cargando = false; // Para evitar dobles clics mientras se guarda

  cunasCargadas: boolean = false;
  colorDetallePeso: string = '';
  colorDetalleEdad: string = '';
  dniMadre: string = '';
  ultimoIdCunaNumerado: number = 0;
  ultimoIdTiempoCuna: string = '';

  fb = inject(FormBuilder);
  cunasDisponibles: Cuna[] = [];


  form!: FormGroup;
  router = inject(Router);
  route = inject(ActivatedRoute);
  onInputCuna(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();
    this.form.get('idCuna')?.setValue(value, { emitEvent: false });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      idPaciente: ['', Validators.required],
      nombrePaciente: ['', Validators.required],
      apellidoPaternoPaciente: ['', Validators.required],
      apellidoMaternoPaciente: ['', Validators.required],
      dniMadre: ['', Validators.required],
      fechaNacimientoPaciente: ['', Validators.required],
      generoPaciente: ['', Validators.required],
      pesoNacimientoPaciente: ['', Validators.required],
      detallePesoNacimientoPaciente: ['', Validators.required],
      edadGestacionalPaciente: ['', Validators.required],
      detalleEdadGestacionalPaciente: ['', Validators.required],
      fechaIngreso: [''],
      fechaSalida: [''],
      area: ['', Validators.required],
      estado: ['Paciente en atención', Validators.required],
      idCuna: ['', Validators.required], // ✅ validadores síncronos
      diagnosticoPaciente: this.fb.group({
        idDiagnosticoPaciente: ['', Validators.required],
        observacionEnfermedad: ['']
      })
    });
    this.diagnosticoPacienteService.listary().subscribe(diagnosticos => {
      const nuevoIdDiagnostico = this.obtenerSiguienteIdDiagnostico(diagnosticos);
      this.form.get('diagnosticoPaciente.idDiagnosticoPaciente')?.setValue(nuevoIdDiagnostico);
    });

    this.cunaService.list().subscribe(cunas => {
      console.log('Cunas disponibles cargadas:', cunas);
      this.cunasDisponibles = cunas.filter(c => c.estadoCuna === 'Disponible').map(c => ({ ...c, idCuna: c.idCuna.trim() }));
      this.cunasCargadas = true;
    });
  }

  obtenerSiguienteIdDiagnostico(diagnosticos: any[]): string {
    const ids = diagnosticos
      .map(d => d.idDiagnosticoPaciente)
      .filter((id: string) => /^D\d+$/.test(id))
      .map((id: string) => parseInt(id.substring(1), 10));

    const max = Math.max(...ids, 0);
    const siguiente = max + 1;
    return `D${siguiente.toString().padStart(4, '0')}`; // Ej: D0001
  }

  onIdCunaChange() {
    const idCuna = this.form.get('cuna.idCuna')?.value;
    console.log('ID Cuna actualizado:', idCuna);
  }

  create() {
    if (!this.cunasCargadas) {
      return;
    }
    

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Por favor completa todos los campos requeridos.');
      return;
    }
    if (this.cargando) return; // Evitar doble clic
    this.cargando = true;

    const formData = this.form.value;
    const idCunaSeleccionada = formData.idCuna.trim().toUpperCase();

    const cunaSeleccionada = this.cunasDisponibles.find(c => c.idCuna === idCunaSeleccionada);
    if (!cunaSeleccionada) {
      alert('La cuna seleccionada no está disponible. Por favor elija otra.');
      return;
    }

    this.cunaService.obtenerPorId(idCunaSeleccionada).subscribe({
      next: (cunaActual) => {
        if (!cunaActual) {
          alert('La cuna ingresada no existe en el sistema.');
          this.cargando = false;
          return;
        }

        if (cunaActual.estadoCuna !== 'Disponible') {
          alert('La cuna seleccionada ya no está disponible. Por favor, elige otra.');
          this.cargando = false;
          return;
        }
        // 1. Crear diagnóstico del paciente
        const diagnosticoForm = this.form.get('diagnosticoPaciente')?.value;
        const diagnosticoPaciente: DiagnosticoPaciente = {
          idDiagnosticoPaciente: diagnosticoForm.idDiagnosticoPaciente,
          observacionEnfermedad: diagnosticoForm.observacionEnfermedad?.trim() || 'Sin observación'
        };

        this.diagnosticoPacienteService.guardar(diagnosticoPaciente).subscribe({
          next: (diagnosticoGuardado) => {
            if (!diagnosticoGuardado) {
              return;
            }
            // 2. Crear paciente con referencia al diagnóstico y cuna
            const paciente: Paciente = {
              idPaciente: formData.idPaciente,
              nombrePaciente: formData.nombrePaciente,
              apellidoPaternoPaciente: formData.apellidoPaternoPaciente,
              apellidoMaternoPaciente: formData.apellidoMaternoPaciente,
              fechaNacimientoPaciente: formData.fechaNacimientoPaciente,
              generoPaciente: formData.generoPaciente,
              pesoNacimientoPaciente: formData.pesoNacimientoPaciente,
              detallePesoNacimientoPaciente: formData.detallePesoNacimientoPaciente,
              edadGestacionalPaciente: formData.edadGestacionalPaciente,
              dniMadre: formData.dniMadre,
              detalleEdadGestacionalPaciente: formData.detalleEdadGestacionalPaciente,
              fechaIngreso: getFechaLocal(),
              fechaFinal: formData.fechaFinal,
              area: formData.area,
              estado: formData.estado,
              diagnosticoPaciente: diagnosticoGuardado,
              cuna: cunaActual // Asociación directa
            };
            console.log("Datos antes de enviar", paciente);
            this.pacienteService.create(paciente).subscribe({
              next: (pacienteGuardado) => {
                if (!pacienteGuardado) {
                  alert('No se pudo registrar el paciente.');
                  return;
                }
                // 3. Actualizar estado de la cuna a "No Disponible"
                const cunaActualizada: Cuna = {
                  ...cunaActual,
                  estadoCuna: 'No Disponible'
                };
                this.cunaService.actualizar(cunaActualizada).subscribe(() => {
                  alert('Historia clínica registrada con éxito.');
                  this.router.navigate(['/enfermedades-paciente', diagnosticoGuardado.idDiagnosticoPaciente]);
                });
              },
              error: (err) => {
                console.error('Error al guardar paciente:', err);
                alert('Error al guardar paciente.');
              }
            });
          },
          error: (err) => {
            console.error('Error al registrar diagnóstico:', err);
            alert('Error al registrar diagnóstico.');
          }
        });
      },
      error: (err) => {
        console.error('Error al verificar cuna:', err);
        alert('Error al verificar la cuna.');
        this.cargando = false;
      }
    });
  }

  actualizarDetallePeso() {
    const peso = +this.form.get('pesoNacimientoPaciente')?.value;
    let mensaje = '';
    if (peso >= 4000) {
      mensaje = 'Macrosómico';
      this.colorDetallePeso = 'fondo-negro';
    } else if (peso >= 2500) {
      mensaje = 'Adecuado';
      this.colorDetallePeso = 'fondo-verde';
    } else if (peso >= 1500) {
      mensaje = 'Bajo peso';
      this.colorDetallePeso = 'fondo-rojo';
    } else if (peso >= 1001) {
      mensaje = 'Muy bajo peso';
      this.colorDetallePeso = 'fondo-rojo';
    } else if (peso > 0) {
      mensaje = 'Extremadamente bajo peso al nacer';
      this.colorDetallePeso = 'fondo-rojo';
    } else {
      mensaje = '';
      this.colorDetallePeso = '';
    }
    this.form.get('detallePesoNacimientoPaciente')?.setValue(mensaje);
  }

  actualizarDetalleEdad() {
    const edad = +this.form.get('edadGestacionalPaciente')?.value;
    let mensaje = '';
    if (edad >= 42) {
      mensaje = 'PostTermino';
      this.colorDetalleEdad = 'fondo-negro';
    } else if (edad >= 37) {
      mensaje = 'Termino';
      this.colorDetalleEdad = 'fondo-verde';
    } else if (edad > 0) {
      mensaje = 'Pretermino';
      this.colorDetalleEdad = 'fondo-morado';
    } else {
      mensaje = '';
      this.colorDetalleEdad = '';
    }
    this.form.get('detalleEdadGestacionalPaciente')?.setValue(mensaje);
  }
  regresar() {
    this.router.navigate(['/menu-historia']);
  }
}

function getFechaLocal(): string {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = (hoy.getMonth() + 1).toString().padStart(2, '0');
  const day = hoy.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
