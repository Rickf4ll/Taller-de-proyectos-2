// registro-autologa.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  
import { Router } from '@angular/router';
import { RegistroAutologaService } from '../services/registro-autologa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-autologa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-autologa.component.html',
  styleUrls: ['./registro-autologa.component.css'],
})
export class RegistroAutologaComponent {
  busqueda: string = '';
  madreEncontrada: any = null;
  madreValidaParaDonar: boolean = false;
  
  nuevoRegistro = {
    cantidad: null as number | null,
    hora: this.getCurrentDateTime(),
    idMadre: ''
  };
  
  historial: any[] = [];

  constructor(
    private router: Router,
    private registroService: RegistroAutologaService
  ) {}

  private getCurrentDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  limpiar(): void {
    this.busqueda = '';
    this.madreEncontrada = null;
    this.madreValidaParaDonar = false;
    this.nuevoRegistro = {
      cantidad: null,
      hora: this.getCurrentDateTime(),
      idMadre: ''
    };
    this.historial = [];
  }

  buscar(): void {
    if (!this.busqueda) return;

    this.registroService.getAll().subscribe({
      next: (registros) => {
        const registrosFiltrados = registros.filter(reg => 
          reg.madre?.idMadre === this.busqueda || 
          reg.madre?.paciente?.cuna?.idCuna === this.busqueda
        );
        
        if (registrosFiltrados.length > 0) {
          this.verificarMadre(registrosFiltrados[0].madre.idMadre);
        } else {
          this.verificarMadreDirectamente(this.busqueda);
        }
      },
      error: (err) => {
        console.error('Error al buscar registros:', err);
        Swal.fire('Error', 'Error al buscar registros', 'error');
      }
    });
  }

  verificarMadreDirectamente(idMadreOrCuna: string): void {
    this.registroService.getMadreById(idMadreOrCuna).subscribe({
      next: (madre) => {
        if (madre) {
          this.procesarMadreEncontrada(madre);
        } else {
          Swal.fire('No encontrada', 'No se encontró ninguna madre con ese DNI', 'warning');
          this.limpiar();
        }
      },
      error: (err) => {
        console.error('Error al buscar madre:', err);
        Swal.fire('Error', 'No se encontró ninguna madre con ese DNI', 'error');
      }
    });
  }

  verificarMadre(idMadre: string): void {
    this.registroService.getMadreById(idMadre).subscribe({
      next: (madre) => {
        if (madre) {
          this.procesarMadreEncontrada(madre);
        } else {
          Swal.fire('Advertencia', 'No se encontraron datos completos de la madre', 'warning');
          this.limpiar();
        }
      },
      error: (err) => {
        console.error('Error al verificar madre:', err);
        Swal.fire('Error', 'Error al verificar datos de la madre', 'error');
      }
    });
  }

  procesarMadreEncontrada(madre: any): void {
    this.madreEncontrada = madre;
    this.nuevoRegistro.idMadre = madre.idMadre;
    
    this.madreValidaParaDonar = 
      madre.aptaParaDonar === 'Apta' && 
      madre.donarLeche === 'Si';
    
    if (!this.madreValidaParaDonar) {
      Swal.fire('No apta', 'La madre no está apta para donar o no tiene consentimiento', 'warning');
    }
    
    this.cargarHistorial(madre.idMadre);
  }

  cargarHistorial(idMadre: string): void {
    this.registroService.getAll().subscribe({
      next: (registros) => {
        this.historial = registros
          .filter(reg => reg.madre?.idMadre === idMadre)
          .map(reg => ({
            cantidad: reg.cantidad,
            hora: reg.hora,
            cuna: reg.madre?.paciente?.cuna?.idCuna || '---'
          }));
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
      }
    });
  }

  guardar(): void {
    if (!this.madreValidaParaDonar) {
      Swal.fire('No apta', 'La madre no está apta para donar o no tiene consentimiento', 'warning');
      return;
    }
  
    if (!this.nuevoRegistro.cantidad || !this.nuevoRegistro.idMadre) {
      Swal.fire('Faltan datos', 'Por favor complete todos los campos requeridos', 'info');
      return;
    }
  
    this.nuevoRegistro.hora = this.getCurrentDateTime();
    
    this.registroService.createRegistro({
      cantidad: this.nuevoRegistro.cantidad,
      hora: this.nuevoRegistro.hora,
      idMadre: this.nuevoRegistro.idMadre
    }).subscribe({
      next: (respuesta) => {
        this.historial.unshift({
          cantidad: respuesta.cantidad,
          hora: respuesta.hora,
          cuna: this.madreEncontrada?.paciente?.cuna?.idCuna || '---'
        });
        
        this.nuevoRegistro.cantidad = null;
        this.nuevoRegistro.hora = this.getCurrentDateTime();
        
        Swal.fire('Guardado Exitoso', '', 'success');
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        Swal.fire('Error', 'Error al guardar el registro. Verifica la consola para más detalles.', 'error');
      }
    });
  }

  regresar() {
    this.router.navigate(['/menu-almacen']);
  }
}
