import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MadreService } from '../services/madre.service';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Madre } from '../model/madre.interface';
import { Apoderado } from '../model/apoderado.interface';
import { MatCardModule } from '@angular/material/card';
import { PacienteService } from '../services/paciente.service';


@Component({
  selector: 'app-registro-madre',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    HttpClientModule
  ],
  templateUrl: './registro-madre.component.html',
  styleUrl: './registro-madre.component.css'
})
export default class RegistroMadreComponent implements OnInit {
  fileSeleccionado: File | null = null;
  private madreService = inject(MadreService);
  private pacienteService = inject(PacienteService); // Cambiar a PacienteService si es necesario
  fotoBase64: string | null = null;

  fotosBase64: string[] = [];
  private fb = inject(FormBuilder);
  form!: FormGroup; // Definir el tipo de form como FormGroup
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const idPaciente = this.route.snapshot.paramMap.get('idPaciente');
    if (!idPaciente) {
      this.router.navigate(['/alguna-ruta-de-error-o-listado']);
      return;
    }


    // Inicializar el formulario
    this.form = this.fb.group({
      idMadre: [''],
      nombreMadre: [''],
      apellidoPaternoMadre: [''],
      apellidoMaternoMadre: [''],
      fechaNacimientoMadre: [''],
      telefonoMadre: [''],
      direccionActualMadre: [''],
      departamento: [''],
      provincia: [''],
      distrito: [''],
      centroSaludControlProcedencia: [''],
      numeroControles: [''],
      ocupacion: [''],
      pesoInicialMadreGestante: [''],
      pesoFinalMadreGestante: [''],
      tallaMadre: [''],
      transfusionSangreMadre: [''],
      consumoCigarros: [''],
      consumoDrogas: [''],
      consumoMedicamentos: [''],
      enfermedades: [''],
      pruebaSerologicos: [''],
      pruebaSifilis: [''],
      pruebaHepatitis: [''],
      pruebaVIH: [''],
      examenHemoglobina: [''],
      donarLeche: [''],
      aptaParaDonar: [''],
      menorDeEdad: [''],
      consentimientoMadre: [''],
      enfermedadActual: [''],
      paciente: this.fb.group({
        idPaciente: [idPaciente, Validators.required],
        nombrePaciente: [''],
        apellidoPaternoPaciente: [''],
        apellidoMaternoPaciente: [''],
        fechaNacimientoPaciente: [''],
        generoPaciente: [''],
        pesoNacimientoPaciente: [''],
        detallePesoNacimientoPaciente: [''],
        edadGestacionalPaciente: [''],
        detalleEdadGestacionalPaciente: [''],
        area: [''],
        estado: [''],
        diagnosticoPaciente: this.fb.group({
          idDiagnosticoPaciente: [''],
          observacionEnfermedad: ['']
        })
      })
    });

    // Obtener los datos del paciente
    this.pacienteService.get(idPaciente).subscribe(paciente => {
      if (paciente) {
        this.form.patchValue({
          paciente: {
            idPaciente: paciente.idPaciente,
            nombrePaciente: paciente.nombrePaciente,
            apellidoPaternoPaciente: paciente.apellidoPaternoPaciente,
            apellidoMaternoPaciente: paciente.apellidoMaternoPaciente,
            fechaNacimientoPaciente: paciente.fechaNacimientoPaciente,
            generoPaciente: paciente.generoPaciente,
            pesoNacimientoPaciente: paciente.pesoNacimientoPaciente,
            detallePesoNacimientoPaciente: paciente.detallePesoNacimientoPaciente,
            edadGestacionalPaciente: paciente.edadGestacionalPaciente,
            detalleEdadGestacionalPaciente: paciente.detalleEdadGestacionalPaciente,
            area: paciente.area,
            estado: paciente.estado,
            diagnosticoPaciente: paciente.diagnosticoPaciente
          }
        });
      } else {
        console.error('Paciente no encontrado');
        // Mostrar un mensaje o tomar alguna acción si el paciente no se encuentra
      }
    });
  }



  async create() {
    const formData = this.form.value;

    // Preparar los datos para enviar
    const madreParaBackend = {
      idMadre: formData.idMadre,
      nombreMadre: formData.nombreMadre,
      apellidoPaternoMadre: formData.apellidoPaternoMadre,
      apellidoMaternoMadre: formData.apellidoMaternoMadre,
      fechaNacimientoMadre: formData.fechaNacimientoMadre,
      telefonoMadre: formData.telefonoMadre,
      tallaMadre: formData.tallaMadre,
      departamento: formData.departamento,
      provincia: formData.provincia,
      distrito: formData.distrito,
      direccionActualMadre: formData.direccionActualMadre,
      centroSaludControlProcedencia: formData.centroSaludControlProcedencia,
      numeroControles: formData.numeroControles,
      ocupacion: formData.ocupacion,
      pesoInicialMadreGestante: formData.pesoInicialMadreGestante,
      pesoFinalMadreGestante: formData.pesoFinalMadreGestante,
      transfusionSangreMadre: formData.transfusionSangreMadre,
      consumoCigarros: formData.consumoCigarros,
      consumoDrogas: formData.consumoDrogas,
      consumoMedicamentos: formData.consumoMedicamentos,
      enfermedades: formData.enfermedades,
      pruebaSerologicos: formData.pruebaSerologicos,
      pruebaSifilis: formData.pruebaSifilis,
      pruebaHepatitis: formData.pruebaHepatitis,
      pruebaVIH: formData.pruebaVIH,
      examenHemoglobina: formData.examenHemoglobina,
      enfermedadActual: formData.enfermedadActual,
      donarLeche: formData.donarLeche,
      aptaParaDonar: formData.aptaParaDonar,
      menorDeEdad: formData.menorDeEdad,
      consentimientoMadre: formData.consentimientoMadre,  // Este campo es null inicialmente o basado en las fotos
      paciente: {
        idPaciente: formData.paciente.idPaciente,
        nombrePaciente: formData.paciente.nombrePaciente,
        apellidoPaternoPaciente: formData.paciente.apellidoPaternoPaciente,
        apellidoMaternoPaciente: formData.paciente.apellidoMaternoPaciente,
        fechaNacimientoPaciente: formData.paciente.fechaNacimientoPaciente,
        generoPaciente: formData.paciente.generoPaciente,
        pesoNacimientoPaciente: formData.paciente.pesoNacimientoPaciente,
        detallePesoNacimientoPaciente: formData.paciente.detallePesoNacimientoPaciente,
        edadGestacionalPaciente: formData.paciente.edadGestacionalPaciente,
        detalleEdadGestacionalPaciente: formData.paciente.detalleEdadGestacionalPaciente,
        area: formData.paciente.area,
        estado: formData.paciente.estado,
        diagnosticoPaciente: {
          idDiagnosticoPaciente: formData.paciente.diagnosticoPaciente.idDiagnosticoPaciente,
          observacionEnfermedad: formData.paciente.diagnosticoPaciente.observacionEnfermedad,
        }
      }
    };

    // Mostrar los datos a enviar en el log para verificar
    console.log('Datos enviados:', madreParaBackend);

    // Realizar la solicitud POST al backend
    this.madreService.create(madreParaBackend).subscribe({
      next: (madreCreada: any) => {
        console.log("hola")
        console.log(this.fileSeleccionado);
        if (this.fileSeleccionado) {
          this.madreService.subirConsentimiento(madreCreada.idMadre, this.fileSeleccionado).subscribe({
            next: () => {
              console.log('Imagen subida correctamente');
              this.router.navigate(['/ver-historia-clinica', formData.paciente.idPaciente]);
            },
            error: (error) => {
              console.error('Error al subir la imagen:', error);
              alert('La madre fue registrada, pero hubo un problema al subir la imagen.');
            }
          });
        } else {
          this.router.navigate(['/ver-historia-clinica', formData.paciente.idPaciente]);
        }
        console.log('Madre registrada correctamente');
        this.router.navigate(['/ver-historia-clinica', formData.paciente.idPaciente]);
        // Navegar después de la creación exitosa
      },
      error: (error) => {
        console.error('Error al registrar la madre:', error);
        alert('Hubo un error al registrar los datos. Por favor, intente de nuevo.');
      }
    });
  }

  // Método para manejar la selección de archivos
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      this.fileSeleccionado = input.files[0];
    }
  }

  // Método para convertir un archivo a base64
  private convertirABase64(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      // Agregar la foto convertida al array
      this.fotosBase64.push(reader.result as string);
      this.actualizarConsentimientoMadre(); // Actualizar el campo del formulario
    };

    reader.readAsDataURL(file); // Leer el archivo como base64
  }

  // Método para eliminar una foto
  eliminarFoto(index: number) {
    this.fotosBase64.splice(index, 1); // Eliminar la foto del array
    this.actualizarConsentimientoMadre(); // Actualizar el campo del formulario
  }

  // Método para actualizar el campo consentimientoMadre
  private actualizarConsentimientoMadre() {
    // Convertir el array de fotos a una cadena JSON
    const fotosJSON = JSON.stringify(this.fotosBase64);
    this.form.get('consentimientoMadre')?.setValue(fotosJSON);
  }


  regresar() {
    const idPaciente = this.route.snapshot.paramMap.get('idPaciente');
    if (idPaciente) {
      this.router.navigate([`/ver-historia-clinica`, idPaciente]);
    } else {
      this.router.navigate(['/menu-historia']); // respaldo si no hay idPaciente
    }
  }
  sections = {
    personal: true,
    contacto: false,
    salud: false,
    pruebas: false,
    adicional: false,
  };
  toggleSection(section: keyof typeof this.sections): void {
    this.sections[section] = !this.sections[section];
  }
}