import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Enfermedad } from "../model/enfermedad.interface";
import { Cuna, Paciente, TiempoPacienteCuna } from "../model/tiempopacientecuna.interface";
import { CunaService } from "../services/cuna.service";
import { TiempoPacienteCunaService } from "../services/tiempopacientecuna.service";
import { Component, inject, OnInit } from "@angular/core";
import { EnfermedadService } from "../services/enfermedad.service";
import { PacienteService } from "../services/paciente.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-actualizar-historia-clinica',
  templateUrl: './actualizar-historia-clinica.component.html',
  styleUrls: ['./actualizar-historia-clinica.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  standalone: true
})
export default class ActualizarHistoriaClinicaComponent implements OnInit {
  historiaForm!: FormGroup;
  enfermedadForm!: FormGroup;

  idPaciente!: string;
  paciente: any;
  relacionActual!: TiempoPacienteCuna;
  nuevaCunaSeleccionada!: Cuna;

  enfermedades: any[] = [];
  enfermedadesPorCategoria: { [categoria: string]: any[] } = {};
  categorias: string[] = [];
  mostrarModalEnfermedad = false;
  ultimoIdEnfermedad : string = '';
  categoriasDisponibles: string[] = ['Gastrointestinales', 'Respiratorios', 'Infecciosos', 'Otros'];
  categoriaSeleccionada: string = '';
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private pacienteService: PacienteService,
    private enfermedadService: EnfermedadService,
    private cunaService: CunaService,
    private tiempoPacienteCunaService: TiempoPacienteCunaService
  ) {}

  ngOnInit(): void {
    this.idPaciente = this.route.snapshot.paramMap.get('idPaciente')!;
    this.inicializarFormularios();
    this.cargarDatosPaciente();
    this.cargarEnfermedadesDesdeBD();
    this.cargarRelacionPacienteCuna();
    
  }

  inicializarFormularios(): void {
    this.historiaForm = this.fb.group({
      idPaciente: [''],
      nombrePaciente: [''],
      apellidoPaternoPaciente: [''],
      apellidoMaternoPaciente: [''],
      fechaNacimientoPaciente: [''],
      generoPaciente: [''],
      pesoNacimientoPaciente: [''],
      edadGestacionalPaciente: [''],
      detallePesoNacimientoPaciente: [''],
      detalleEdadGestacionalPaciente: [''],
      area: [''],
      estado: [''],
      idCuna: [''],
      fechaInicioCuna: [''],
      fechaFinalCuna: [''],
      estadoCuna: [''],
      idDiagnosticoPaciente: ['']
    });

    this.enfermedadForm = this.fb.group({
      nombreEnfermedad: ['', Validators.required],
      categoriaEnfermedad: ['', Validators.required],
    });
  }

  cargarDatosPaciente(): void {
    this.pacienteService.get(this.idPaciente).subscribe((data) => {
      if (data) {
        this.paciente = data;
        this.historiaForm.patchValue(data);
      }
    });
  }

  cargarRelacionPacienteCuna(): void {
    this.tiempoPacienteCunaService.obtenerRelacionPorPaciente(this.idPaciente).subscribe((relacion) => {
      if (relacion) {
        this.relacionActual = relacion;
        this.historiaForm.patchValue({
          idCuna: relacion.cuna.idCuna,
          fechaInicioCuna: relacion.fechaInicio,
          fechaFinalCuna: relacion.fechaFinal,
          estadoCuna: relacion.cuna.estadoCuna
        });
      }
    });
  }

  cargarEnfermedadesDesdeBD() {
    this.enfermedadService.listarTodas().subscribe((enfermedades) => {
      this.enfermedadesPorCategoria = enfermedades.reduce((acc, enfermedad) => {
        const categoria = enfermedad.categoriaEnfermedad.toLowerCase(); // 👈 Normalizamos
        if (!acc[categoria]) {
          acc[categoria] = [];
        }
        acc[categoria].push(enfermedad);
        return acc;
      }, {} as { [categoria: string]: Enfermedad[] });

      this.categoriasDisponibles = Object.keys(this.enfermedadesPorCategoria);

      const ids = enfermedades.map(e => e.idEnfermedad);
      this.ultimoIdEnfermedad = this.obtenerSiguienteIdEnfermedad(ids);
    });
  }

  obtenerSiguienteId(data: any[]): number {
    const ids = data.map(e => parseInt(e.id, 10)).filter(id => !isNaN(id));
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }
  obtenerSiguienteIdEnfermedad(ids: string[]): string {
    const numeros = ids
      .filter(id => /^E\d+$/.test(id)) // Asegura que el formato sea válido
      .map(id => parseInt(id.substring(1), 10));

    const max = Math.max(...numeros, 0); // Por si está vacío
    const siguiente = max + 1;

    return `E${siguiente.toString().padStart(3, '0')}`; // Ej: E025
  }
  abrirModal(): void {
    console.log('Abrir modal llamado');
    this.mostrarModalEnfermedad = true;
  }

  cerrarModal(): void {
    this.mostrarModalEnfermedad = false;
  }

  guardarEnfermedadDesdeModal() {
    const nombre = this.enfermedadForm.get('nombreEnfermedad')?.value?.trim();
    const categoriaInput = this.enfermedadForm.get('categoriaEnfermedad')?.value;

    const categoria = categoriaInput.charAt(0).toUpperCase() + categoriaInput.slice(1).toLowerCase(); // 💡 transforma "otros" → "Otros"

    if (nombre && categoria) {
      const nuevaEnfermedad: Enfermedad = {
        idEnfermedad: this.ultimoIdEnfermedad,
        nombreEnfermedad: nombre,
        categoriaEnfermedad: categoria
      };

      this.enfermedadService.guardar(nuevaEnfermedad).subscribe((enfermedad) => {
        if (enfermedad) {
          this.cargarEnfermedadesDesdeBD();
          this.cerrarModal();
        }
      });
    } else {
      alert('Por favor completa todos los campos.');
    }
  }

  actualizarHistoriaClinica(): void {
    const nuevaCunaId = this.historiaForm.value.idCuna;
    const hoy = new Date();

    this.cunaService.obtenerPorId(nuevaCunaId).subscribe((cunaNueva) => {
      this.nuevaCunaSeleccionada = cunaNueva;

      if (this.relacionActual.cuna.idCuna !== this.nuevaCunaSeleccionada.idCuna) {
        // Cambió de cuna
        const cunaAnterior = { ...this.relacionActual.cuna, estadoCuna: 'Disponible' };
        const nuevaCuna = { ...this.nuevaCunaSeleccionada, estadoCuna: 'No Disponible' };

        this.cunaService.actualizar(cunaAnterior).subscribe(() => {
          this.cunaService.actualizar(nuevaCuna).subscribe(() => {
            const nuevaRelacion: TiempoPacienteCuna = {
              ...this.relacionActual,
              fechaInicio: hoy,
              fechaFinal: null,
              cuna: nuevaCuna,
              paciente: this.paciente
            };

            this.tiempoPacienteCunaService.actualizarRelacion(nuevaRelacion).subscribe(() => {
              this.actualizarDatosPaciente();
            });
          });
        });
      } else {
        // Misma cuna
        const relacionActualizada: TiempoPacienteCuna = {
          ...this.relacionActual,
          fechaInicio: this.historiaForm.value.fechaInicioCuna || hoy,
          fechaFinal: this.historiaForm.value.fechaFinalCuna || null
        };

        this.tiempoPacienteCunaService.actualizarRelacion(relacionActualizada).subscribe(() => {
          this.actualizarDatosPaciente();
        });
      }
    });
  }

  actualizarDatosPaciente(): void {
    const pacienteActualizado = this.historiaForm.getRawValue();

    this.pacienteService.update(this.paciente.idPaciente, pacienteActualizado).subscribe({
      next: () => {
        console.log('Paciente actualizado correctamente');
        this.router.navigate(['/ver-historia-clinica', this.paciente.idPaciente]);
      },
      error: (err: any) => console.error('Error actualizando paciente', err)
    });
  }

  formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }
  regresar() {
    const idPaciente = this.route.snapshot.paramMap.get('idPaciente');
    if (idPaciente) {
      this.router.navigate([`/ver-historia-clinica`, idPaciente]);
    } else {
      this.router.navigate(['/menu-historia']); // respaldo si no hay idPaciente
    }
  }
  
}