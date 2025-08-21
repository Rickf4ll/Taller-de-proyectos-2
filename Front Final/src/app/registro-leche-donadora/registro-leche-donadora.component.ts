// registro-leche.component.ts
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistroLecheService } from '../services/registro-leche-donadora.service';
import { RegistroLeche } from '../model/registro-leche-donadora';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-registro-leche-donadora',
  templateUrl: './registro-leche-donadora.component.html',
  styleUrls: ['./registro-leche-donadora.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    ReactiveFormsModule,
    RouterModule,
    
  ]
})

export default class RegistroLecheComponent {
  lecheForm: FormGroup;
  registrosdonantes: FormGroup;
  idDonadora: string;
  registrosExistentes: RegistroLeche[] = [];
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private registroLecheService: RegistroLecheService
  ) {
    this.lecheForm = this.fb.group({
      registros: this.fb.array([this.crearRegistro()])
    });
    this.registrosdonantes = this.fb.group({
      registros: this.fb.array([])
    });
    const id = this.route.snapshot.paramMap.get('id');
if (!id) {
  throw new Error('ID de donadora no proporcionado');
}
this.idDonadora = id;
  }

  crearRegistro(numero: number = 1): FormGroup {
    return this.fb.group({
      numero: [numero],
      cantidad: ['', [
        Validators.required,
        Validators.min(0.01),
        Validators.pattern(/^\d+(\.\d{1,2})?$/) // Validar decimales
      ]],
      hora: [this.obtenerHoraActual(), [
        Validators.required,
        Validators.pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/) // Validar formato HH:mm
      ]]
    });
  }

  get registros(): FormArray {
    return this.lecheForm.get('registros') as FormArray;
  }

  obtenerHoraActual(): string {
    const ahora = new Date();
    return ahora.toTimeString().slice(0, 5);
  }

  agregarFila(): void {
    const ultimoNumero = this.registros.length > 0 
      ? this.registros.at(-1).value.numero
      : 0;
    
    this.registros.push(this.crearRegistro(ultimoNumero + 1));
  }

  eliminarFila(index: number): void {
    if (this.registros.length > 1) {
      this.registros.removeAt(index);
      this.actualizarNumeracion();
    }
  }

  actualizarNumeracion(): void {
    this.registros.controls.forEach((control, index) => {
      control.patchValue({ numero: index + 1 });
    });
  }

guardarRegistros() {
  if (!this.idDonadora) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Error: No se especificó la donadora",
    });
    return;
  }

  const payload = this.lecheForm.value.registros.map((registro: any) => ({
    cantidad: registro.cantidad,
    hora: registro.hora, // Enviar como string directamente
    donadora: {
      idDonadora: this.idDonadora
    }
  }));

  this.registroLecheService.crearRegistro(payload).subscribe({
    next: () => {
      Swal.fire({
        title: "Datos limpiados correctamente",
        icon: "success",
        draggable: true
      });
      this.limpiarDatos();
      this.listarRegistros(); // Actualizar lista después de guardar
    },
    error: (err) => {
      console.error('Error completo:', err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error al guardar los registros",
      });
    }
  });
}

  limpiarDatos(): void {
    this.registros.clear();
    this.agregarFila();

    localStorage.removeItem('registrosLeche');
    Swal.fire({
      title: "Datos limpiados correctamente",
      icon: "success",
      draggable: true
    });
  }

 
  // En registro-leche.component.ts
listarRegistros(): void {
  this.registroLecheService.getRegistrosPorDonadora(this.idDonadora)
    .subscribe({
      next: (registros) => {
        this.registrosExistentes = registros;
        
        if (registros.length > 0) {
          console.log('Datos encontrados', registros);
        } else {
          console.log('No se encontraron datos');
        }
      },
      error: (err) => {
        console.error('Error al obtener registros:', err);
        console.log('No se encontraron datos');
      }
    });
}
  ngOnInit(): void {
    this.listarRegistros();
  }
}