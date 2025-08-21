import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PacienteService } from '../services/paciente.service';
import { Router } from '@angular/router';
import { pacientes } from '../model/paciente';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule
  ],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css'],
})
export default class PacientesComponent implements OnInit {
  displayedColumns: string[] = [
    'cuna',
    'nombre',
    'paseVisita',
    'verPaseVisita',
    'dispensacion'
  ];
  pacientes: pacientes[] = [];
  uciDataSource: any[] = [];
  quirurgicoDataSource: any[] = [];
  engordeDataSource: any[] = [];
  intermedioDataSource: any[] = [];

  constructor(
    private pacienteService: PacienteService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarYFiltrarPacientes();
  }

  cargarYFiltrarPacientes(): void {
    this.pacienteService.getPacientes().subscribe({
      next: (lista: pacientes[]) => {
        const pacientesFiltrados = lista.filter(p => p.estado === 'Paciente en atención');
        
        this.uciDataSource = [];
        this.quirurgicoDataSource = [];
        this.intermedioDataSource = [];
        this.engordeDataSource = [];

        pacientesFiltrados.forEach(paciente => {
          const area = paciente.area.toUpperCase().trim();
          const pacienteEstructurado = this.estructurarPaciente(paciente);
          
          switch (area) {
            case 'UCIN':
              this.uciDataSource.push(pacienteEstructurado);
              break;
            case 'UCIN QUIRURGICO':
              this.quirurgicoDataSource.push(pacienteEstructurado);
              break;
            case 'INTERMEDIO':
              this.intermedioDataSource.push(pacienteEstructurado);
              break;
            case 'ENGORDE':
              this.engordeDataSource.push(pacienteEstructurado);
              break;
            default:
              console.warn('Área no reconocida:', area, paciente);
          }
        });
      },
      error: (err) => console.error('Error:', err)
    });
  }

  private estructurarPaciente(p: pacientes): any {
    const cunaNumber = p.cuna?.idCuna ? p.cuna.idCuna.toString() : 'Sin cuna';

    return {
      idPaciente: p.idPaciente,
      cunaNumber: cunaNumber,
      nombre: [
        p.nombrePaciente,
        p.apellidoPaternoPaciente ?? '',
        p.apellidoMaternoPaciente ?? ''
      ].join(' ').trim()
    };
  }
}