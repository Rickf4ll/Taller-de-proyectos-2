import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DonadoraService } from '../services/donadora.service';
import { HttpClientModule } from '@angular/common/http';
import { Donadora } from '../model/donadora';
import { MatCardModule } from '@angular/material/card';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-donante',
  templateUrl: './registro-donante.component.html',
  styleUrls: ['./registro-donante.component.css'],
  standalone: true,
  imports: [
    MatToolbarModule,
    MatCardModule,
    ReactiveFormsModule,
    MatIconModule,
    MatRadioModule,
    MatFormFieldModule,
    CommonModule,
    RouterModule,
  ],
})
export default class RegistroDonanteComponent implements OnInit {
  fileSeleccionado: File | null = null;
  sections = {
    personal: true,
    contacto: false,
    salud: false,
    pruebas: false,
    adicional: false,
  };

  private donadoraService = inject(DonadoraService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  fotoBase64: string | null = null;
  fotosBase64: string[] = [];
  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      idDonadora: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8)
      ]],
      nombreDonadora: ['', Validators.required],
      apellidoPaternoDonadora: ['', Validators.required],
      apellidoMaternoDonadora: [''],
      fechaNacimientoDonadora: ['', Validators.required],
      telefonoDonadora: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{9}$/)]
      ],
      tallaDonadora: ['', [Validators.required, Validators.min(0)]],
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required],
      direccionActualDonadora: ['', Validators.required],
      centroSaludControlProcedencia: ['', Validators.required],
      numeroControles: ['', [Validators.required, Validators.min(0)]],
      ocupacion: ['', Validators.required],
      transfusionSangreMadre: [null, Validators.required],
      consumoCigarros: [null, Validators.required],
      consumoDrogas: [null, Validators.required],
      consumoMedicamentos: [null, Validators.required],
      enfermedades: [null, Validators.required],
      pruebaSerologicos: [null, Validators.required],
      pruebaSifilis: [null, Validators.required],
      pruebaHepatitis: [null, Validators.required],
      pruebaVIH: [null, Validators.required],
      examenHemoglobina: [null, Validators.required],
      donarLeche: [null, Validators.required],
      aptaParaDonar: [null, Validators.required],
      consentimientoDonadora: [''],
      enfermedadActual: ['', Validators.required],
    });
  }

  async create() {
    console.log('Estado del formulario:', this.form.status);
  console.log('Errores:', this.form.errors);
  console.log('Valores:', this.form.value);

    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log(`Campo con error: ${key}`, control.errors);
        }
      });
      this.form.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor complete todos los campos obligatorios marcados con *',
      });
      return;
    }

    const formData = this.form.value;
    const donadoraParaBackend = { ...formData };

    this.donadoraService.create(donadoraParaBackend).subscribe({
      next: (response: any) => {
        if (this.fileSeleccionado) {
          this.donadoraService.subirConsentimiento(response.idDonadora, this.fileSeleccionado).subscribe({
            next: () => this.handleSuccess(),
            error: (error) => this.handleFileUploadError(error)
          });
        } else {
          this.handleSuccess();
        }
      },
      error: (error) => this.handleCreateError(error)
    });
  }

  private handleSuccess() {
    Swal.fire({
      title: "Donante registrada",
      icon: "success",
      draggable: true
    });
    this.router.navigate(['/donantes']);
  }

  private handleFileUploadError(error: any) {
    console.error('Error al subir la imagen:', error);
    Swal.fire({
      icon: 'warning',
      title: 'Advertencia',
      text: 'La madre fue registrada, pero hubo un problema al subir el consentimiento'
    });
  }

  private handleCreateError(error: any) {
    console.error('Error al registrar a la donante:', error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Ocurrió un error al registrar la donante"
    });
  }

  toggleSection(section: keyof typeof this.sections): void {
    this.sections[section] = !this.sections[section];
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.fileSeleccionado = input.files[0];
    }
  }

  eliminarFoto(index: number) {
    this.fotosBase64.splice(index, 1);
    this.actualizarConsentimientoMadre();
  }

  private actualizarConsentimientoMadre() {
    this.form.get('consentimientoDonadora')?.setValue(JSON.stringify(this.fotosBase64));
  }
}