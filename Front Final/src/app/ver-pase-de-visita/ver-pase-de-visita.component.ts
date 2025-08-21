import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PaseDeVisitaService } from '../services/pase-de-visita.service';
import { PacienteService } from '../services/paciente.service';
import { Paciente } from '../model/pase-de-visita';
import { PaseDeVisita } from '../model/pase-de-visita';
import { catchError, Observable, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ver-pase-de-visita',
  templateUrl: './ver-pase-de-visita.component.html',
  styleUrls: ['./ver-pase-de-visita.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule,
    MatRadioModule, MatSelectModule, RouterModule,
  ],
})
export default class PaseDeVisitaPage implements OnInit {
  pacienteData: any = {};
  idPaciente!: string;
  idCuna!: string;
  idPaseVisita!: string;
  pesoDiaAnterior: number = 0;
  deltaPeso: number = 0;
  pesoDelDia: number | null = null;
  pesoAnterior: number | null = null;
  pesoNacimiento: number = 0;
  calculatedDeltaPeso: number = 0;

  visitaForm = new FormGroup({
    fecha: new FormControl<Date | null>(null),
    llamadaTelefono: new FormControl<string>({ value: 'Si', disabled: true }),
    pesoDiaAnterior: new FormControl(0),
    pesoDelDia: new FormControl(0),
    nroTomas: new FormControl(0),          // Coincide con nroDeTomasDeLeche
    cantidadToma: new FormControl(0),      // Coincide con cantidadMlPorTomaDeLeche
    tipoLeche: new FormControl('Calostro'),
    contenidoEnergetico: new FormControl('Hipercalorico'),
    viaAdministracion: new FormControl('SOG'),
    calostroterapia: new FormControl('No'),
    area: new FormControl('UCIN')
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paseVisitaService: PaseDeVisitaService,
    private servicioPaciente: PacienteService
  ) {}

  ngOnInit() {
    this.visitaForm.disable();
    this.idPaciente = this.route.snapshot.params['id'];
    this.idCuna = this.route.snapshot.params['idcuna'];
    this.obtenerUltimoPaseVisita();
  }
private obtenerUltimoPaseVisita() {
  this.paseVisitaService.getUltimoPase(this.idPaciente).subscribe({
    next: (pase: PaseDeVisita) => {
      if (pase) {
        // Corregir la fecha para evitar problemas de zona horaria
        const fechaPase = new Date(pase.fechaDia);
        const fechaLocal = new Date(fechaPase.getTime() + fechaPase.getTimezoneOffset() * 60000);

        // Mapear valores al formulario
        this.visitaForm.patchValue({
          fecha: fechaLocal,  // Usamos la fecha corregida
          llamadaTelefono: pase.llamadaTelefono,
          pesoDiaAnterior: pase.pesoDiaAnterior,
          pesoDelDia: pase.pesoDelDia,
          nroTomas: pase.nroDeTomasDeLeche,
          cantidadToma: pase.cantidadMlPorTomaDeLeche,
          tipoLeche: pase.tipoLecheRequerida,
          contenidoEnergetico: pase.contenidoEnergetico,
          viaAdministracion: pase.viaAdministracion,
          calostroterapia: pase.calostroterapia,
          area: this.pacienteData.area
        });

        // Actualizar propiedades para cálculos y display
        this.pesoAnterior = pase.pesoDiaAnterior;
        this.deltaPeso = pase.deltaPeso;

      } else {
        console.log("No se encontraron pases de visita anteriores");
        Swal.fire({
          icon: 'info',
          title: 'No hay registros',
          text: 'No se encontraron pases de visita anteriores para este paciente',
        });
      }
    },
    error: (error) => {
      console.error('Error al obtener último pase:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al obtener el último pase de visita',
      });
    }
  });
}

 
  regresar() {
    this.router.navigate(['/pacientes']);
  }
}
