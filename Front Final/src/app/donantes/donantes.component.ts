import { Component, inject, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DonadoraService } from '../services/donadora.service';
import { Donadora } from '../model/donadora';

@Component({
  selector: 'app-donantes-list',
  templateUrl: './donantes.component.html',
  styleUrls: ['./donantes.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    RouterLink,
    HttpClientModule
  ],
 
})
export default class DonantesListComponent implements OnInit {
  @Input() donadora!: Donadora;
  private donadoraService = inject(DonadoraService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  displayedColumns: string[] = ['dni', 'nombre', 'procura', 'registro'];
  dataSource: any[] = [];  
  
  ngOnInit() {
  this.cargarDatos();
  }
    // Modifica el método cargarDatos
private cargarDatos() {
  this.donadoraService.listar().subscribe({
    next: (data: Donadora[]) => {
      this.dataSource = data.map((donadora: Donadora) => ({
        donadora: donadora, // Guarda el objeto completo
        dni: donadora.idDonadora,
        nombre: `${donadora.nombreDonadora} ${donadora.apellidoPaternoDonadora} ${donadora.apellidoMaternoDonadora}`,
        procura: '',
        registro: ''
      }));
      console.log('Datos cargados:', this.dataSource);
    },
    error: (err) => {
      console.error('Error al cargar datos', err);
    }
  });
}
}
