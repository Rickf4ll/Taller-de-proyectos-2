import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { RegistroLechePasteurizadaService } from '../services/registro-leche-pasteurizada.service';
import { LecheFormulaService } from '../services/registroFormmula.service';


@Component({
  selector: 'app-leches-disponibles',
  templateUrl: './leches-disponibles.component.html',
  providers: [RegistroLechePasteurizadaService, LecheFormulaService],
  styleUrls: ['./leches-disponibles.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule
  ]
})
export class LechesDisponiblesComponent implements OnInit {

  leches: any[] = [];
  formulas: any[] = [];
  showFormulaModal = false;
  loadingFormulas = false; 
  errorFormulas = ''; 

  totalPasteurizada: number = 0;
  totalFormula: number = 0;
  totalGeneral: number = 0;

  constructor(
    private router: Router,
    private registroLecheService: RegistroLechePasteurizadaService,
    private formulaService: LecheFormulaService,

  ) {}

  ngOnInit(): void {
        this.cargarDatos();
  }

  cargarLeches(): void {
    this.registroLecheService.getLeches().pipe(
      catchError(error => {
        console.error('Error cargando leches pasteurizadas:', error);
        return of([]);
      })
    ).subscribe({
      next: (data) => {
        this.leches = this.procesarLeches(data);
      },
      error: (err) => {
        console.error('Error en la carga de leches:', err);
      }
    });
  }

procesarLeches(data: any[]): any[] {
    if (!data || data.length === 0) return [];
    
    const tipos = ['CALOSTRO', 'TRANSICION', 'MADURA'];
    return tipos.map(tipo => {
      const lechesPorTipo = data.filter(leche => 
        leche.tipoLeche && leche.tipoLeche.toUpperCase() === tipo
      );
      
      return {
        tipo,
        tiposCaloricos: [
          {
            calorico: 'Hipercalórico',
            leches: lechesPorTipo.filter(leche => leche.contenidoEnergetico === 'Hipercalorico') || []
          },
          {
            calorico: 'Normocalórico',
            leches: lechesPorTipo.filter(leche => leche.contenidoEnergetico === 'Normocalorico') || []
          },
          {
            calorico: 'Hipocalórico',
            leches: lechesPorTipo.filter(leche => leche.contenidoEnergetico === 'Hipocalorico') || []
          }
        ]
      };
    });
  }

  openFormulaModal(): void {
    this.showFormulaModal = true;
    this.cargarFormulas(); 
  }

 
  cargarFormulas(): void {
    this.loadingFormulas = true;
    this.errorFormulas = '';
    
    this.formulaService.findAll().pipe(
      catchError(error => {
        console.error('Error cargando fórmulas:', error);
        this.errorFormulas = 'Error al cargar las fórmulas';
        this.loadingFormulas = false;
        return of([]);
      })
    ).subscribe({
      next: (data) => {
        this.formulas = data.map(formula => ({
          codigo: formula.codigoLecheFormula || 'N/A',
          kcal: formula.kcal || 0
        }));
        
        this.loadingFormulas = false;
      },
      error: (err) => {
        console.error('Error en la carga de fórmulas:', err);
        this.loadingFormulas = false;
        this.errorFormulas = 'Error al cargar las fórmulas';
      }
    });
  }

  closeFormulaModal(): void {
    this.showFormulaModal = false;
  }

  regresar(): void {
    this.router.navigate(['/menu-almacen']);
  }

  cargarDatos(): void {
    // Usamos forkJoin para cargar ambos conjuntos de datos simultáneamente
    forkJoin({
      leches: this.registroLecheService.getLeches(),
      formulas: this.formulaService.findAll()
    }).pipe(
      catchError(error => {
        console.error('Error cargando datos:', error);
        return of({
          leches: [],
          formulas: []
        });
      })
    ).subscribe({
      next: (data) => {
        this.leches = this.procesarLeches(data.leches);
        this.formulas = data.formulas;
        
        // Calcular totales
        this.calcularTotales(data.leches, data.formulas);
      },
      error: (err) => {
        console.error('Error en la carga de datos:', err);
      }
    });
  }
  calcularTotales(leches: any[], formulas: any[]): void {
    // Calcular total de leche pasteurizada
    this.totalPasteurizada = leches.reduce(
      (sum, leche) => sum + (leche.cantidadLeche || 0), 0
    );
    
    // Calcular total de leche fórmula
    this.totalFormula = formulas.reduce(
      (sum, formula) => sum + (formula.cantidadFormula || 0), 0
    );
    
    // Calcular total general
    this.totalGeneral = this.totalPasteurizada + this.totalFormula;
  }

  
}