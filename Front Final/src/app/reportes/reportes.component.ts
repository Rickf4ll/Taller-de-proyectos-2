import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ReportesService } from '../services/reportes.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reportes', // Selector del componente
  standalone: true, // Indica que el componente es independiente
  imports: [CommonModule, FormsModule, NgChartsModule, RouterModule], // Módulos importados
  templateUrl: './reportes.component.html', // Ruta del archivo HTML asociado
  styleUrls: ['./reportes.component.css'] // Ruta del archivo CSS asociado
})
export class ReportesComponent implements OnInit {
  // Listas de opciones para los filtros
  tiposBebe = ['Macrosómico', 'Adecuado', 'Bajo', 'Muy bajo', 'Extremadamente bajo'];
  tiempos = ['Día', 'Semana', 'Mes', 'Trimestre', 'Año'];
  tiposLeche = ['Autóloga', 'LDM', 'Pasteurizada', 'Fórmula'];
  tiposEdadGestacional = ['Postermino', 'Termino', 'PreTermino Moderado', 'PreTermino Severo', 'PreTermino Extremo'];

  enfermedades: string[] = []; // Lista de enfermedades

  // Variables para almacenar los valores seleccionados en los filtros
  selectedTipoBebe: string = '';
  selectedTiempo: string = '';
  selectedTipoLeche: string = '';
  selectedEdadGestacional: string = '';

  // Datos para los gráficos
  lecheData: number[] = [];
  bebeData: number[] = [];
  enfermedadesData: number[] = [];
  edadGestacionalData: number[] = [];

  // Configuración de los gráficos
  pieChartType: ChartType = 'pie'; // Tipo de gráfico circular
  barChartType: ChartType = 'bar'; // Tipo de gráfico de barras
  pieChartLegend = true; // Mostrar leyenda en el gráfico circular
  barChartLegend = true; // Mostrar leyenda en el gráfico de barras

  // Opciones de configuración para los gráficos
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true, // Hacer el gráfico responsivo
    plugins: {
      legend: { display: true, position: 'top' }, // Mostrar la leyenda en la parte superior
    }
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true, // Hacer el gráfico responsivo
    scales: {
      y: {
        beginAtZero: true // Comenzar el eje Y desde cero
      }
    }
  };

  pieChartData: any; // Datos para el gráfico circular
  barChartData: any; // Datos para el gráfico de barras

  pacientesMap: Map<string, any> = new Map(); // Mapa para almacenar pacientes por ID

  constructor(private reportesService: ReportesService) {} // Inyección del servicio de reportes

  ngOnInit(): void {
    this.cargarDatos(); // Cargar los datos al inicializar el componente
  }

  // Método para limpiar los filtros y recargar los datos
  limpiarFiltros(): void {
    this.selectedTipoBebe = '';
    this.selectedTiempo = '';
    this.selectedTipoLeche = '';
    this.selectedEdadGestacional = '';
    this.cargarDatos();
  }

  // Método para actualizar los gráficos al cambiar los filtros
  actualizarGraficos(): void {
    this.cargarDatos();
  }

  // Método principal para cargar los datos y actualizar los gráficos
  cargarDatos(): void {
    this.reportesService.obtenerPacientes().subscribe(pacientes => {
      this.pacientesMap.clear(); // Limpiar el mapa de pacientes
      pacientes.forEach((pac: any) => {
        this.pacientesMap.set(pac.idPaciente, pac); // Agregar pacientes al mapa
      });

      this.reportesService.obtenerReportePacientes().subscribe(reportes => {
        // Filtrar los reportes según los filtros seleccionados
        const reportesFiltrados = reportes.filter((reporte: any) => {
          const paciente = reporte.paciente;
          if (!paciente) return false;

          const cumpleTipoBebe = !this.selectedTipoBebe || paciente.detallePesoNacimientoPaciente === this.selectedTipoBebe;
          const cumpleEdadGestacional = !this.selectedEdadGestacional || paciente.detalleEdadGestacionalPaciente === this.selectedEdadGestacional;
          const cumpleTiempo = this.filtrarPorTiempo(paciente.fechaIngreso);

          return cumpleTipoBebe && cumpleEdadGestacional && cumpleTiempo;
        });

        // Contar los tipos de leche utilizados
        let conteoLeche: { [key: string]: number } = {
          'Autóloga': 0,
          'LDM': 0,
          'Pasteurizada': 0,
          'Fórmula': 0
        };

        reportesFiltrados.forEach((reporte: any) => {
          if (!this.selectedTipoLeche || this.selectedTipoLeche === 'Autóloga')
            conteoLeche['Autóloga'] += reporte.lecheAutologa || 0;
          if (!this.selectedTipoLeche || this.selectedTipoLeche === 'LDM')
            conteoLeche['LDM'] += reporte.ldm || 0;
          if (!this.selectedTipoLeche || this.selectedTipoLeche === 'Pasteurizada')
            conteoLeche['Pasteurizada'] += reporte.lechePasteurizada || 0;
          if (!this.selectedTipoLeche || this.selectedTipoLeche === 'Fórmula')
            conteoLeche['Fórmula'] += reporte.lecheFormula || 0;
        });

        // Actualizar los datos del gráfico circular
        this.lecheData = this.tiposLeche.map(tipo => conteoLeche[tipo]);
        this.pieChartData = {
          labels: this.tiposLeche,
          datasets: [{
            data: this.lecheData,
            backgroundColor: ['#ffcc80', '#80cbc4', '#a5d6a7', '#ef9a9a']
          }]
        };
      });

      // Filtrar los pacientes según los filtros seleccionados
      const pacientesFiltrados = pacientes.filter((pac: any) => {
        const cumpleTipoBebe = !this.selectedTipoBebe || pac.detallePesoNacimientoPaciente === this.selectedTipoBebe;
        const cumpleEdadGestacional = !this.selectedEdadGestacional || pac.detalleEdadGestacionalPaciente === this.selectedEdadGestacional;
        const cumpleTiempo = this.filtrarPorTiempo(pac.fechaIngreso);
        return cumpleTipoBebe && cumpleEdadGestacional && cumpleTiempo;
      });

      // Contar los pacientes por tipo de bebé y edad gestacional
      this.bebeData = this.contarPorTipo(pacientesFiltrados, 'detallePesoNacimientoPaciente', this.tiposBebe);
      this.barChartData = {
        labels: this.tiposBebe,
        datasets: [{ data: this.bebeData, label: 'Cantidad', backgroundColor: '#4db6ac' }]
      };
      this.edadGestacionalData = this.contarPorTipo(pacientesFiltrados, 'detalleEdadGestacionalPaciente', this.tiposEdadGestacional);

      // Obtener y procesar las enfermedades de los pacientes
      this.reportesService.obtenerEnfermedadesPaciente().subscribe(enfermedadesData => {
        const contador: { [nombre: string]: number } = {};

        enfermedadesData.forEach((item: any) => {
          const idPaciente = item.diagnosticoPaciente?.idDiagnosticoPaciente?.substring(1);
          const paciente = this.pacientesMap.get(idPaciente);
          if (!paciente) return;

          const cumpleTipoBebe = !this.selectedTipoBebe || paciente.detallePesoNacimientoPaciente === this.selectedTipoBebe;
          const cumpleEdadGestacional = !this.selectedEdadGestacional || paciente.detalleEdadGestacionalPaciente === this.selectedEdadGestacional;
          const cumpleTiempo = this.filtrarPorTiempo(paciente.fechaIngreso);

          if (cumpleTipoBebe && cumpleEdadGestacional && cumpleTiempo) {
            const nombre = item.enfermedad?.nombreEnfermedad;
            if (nombre) {
              contador[nombre] = (contador[nombre] || 0) + 1;
            }
          }
        });

        // Actualizar los datos de enfermedades
        this.enfermedades = Object.keys(contador);
        this.enfermedadesData = Object.values(contador);
      });
    });
  }

  // Método para contar elementos por tipo
  contarPorTipo(data: any[], campo: string, tipos: string[]): number[] {
    const conteo: { [key: string]: number } = {};
    tipos.forEach(t => conteo[t] = 0);
    data.forEach(item => {
      const valor = item[campo];
      if (valor && conteo.hasOwnProperty(valor)) {
        conteo[valor]++;
      }
    });
    return tipos.map(t => conteo[t]);
  }

  // Método para filtrar datos según el tiempo seleccionado
  filtrarPorTiempo(fechaIngreso: string): boolean {
    if (!this.selectedTiempo) return true;
    const ingreso = new Date(fechaIngreso);
    const ahora = new Date();
    const diffMs = ahora.getTime() - ingreso.getTime();
    const diffDias = diffMs / (1000 * 60 * 60 * 24);

    switch (this.selectedTiempo) {
      case 'Día': return diffDias <= 1;
      case 'Semana': return diffDias <= 7;
      case 'Mes': return diffDias <= 30;
      case 'Trimestre': return diffDias <= 90;
      case 'Año': return diffDias <= 365;
      default: return true;
    }
  }
}