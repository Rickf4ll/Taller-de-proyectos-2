import { Component, OnInit, inject } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reporte-por-paciente',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule, RouterLink],
  templateUrl: './reporte-por-paciente.component.html',
  styleUrls: ['./reporte-por-paciente.component.css']
})
export class ReportePorPacienteComponent implements OnInit {
  private route = inject(ActivatedRoute);

  paciente = {
    codigo: '',
    nombre: '',
    apellidos: '',
    numeroCuna: '',
    diagnostico: ''
  };

  tiposLeche = ['Autóloga', 'LDM', 'Pasteurizada', 'Fórmula'];
  staticLecheData: number[] = [0, 0, 0, 0];

  // Declarar las propiedades faltantes
  pieChartType: ChartType = 'pie';
  pieChartLegend: boolean = true;

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw as number;
            const total = (context.dataset.data as number[]).reduce((sum, current) => sum + current, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
            return `${label}: ${value} (${percentage})`;
          }
        }
      }
    }
  };

  pieChartData: any;

  constructor() {}

  ngOnInit(): void {
    this.cargarDatosEstaticosGrafico();
    const idPaciente = this.route.snapshot.paramMap.get('idPaciente');
    if (idPaciente && idPaciente.startsWith('HC')) {
      const idPacienteSinHC = idPaciente.substring(2); // Quitar los primeros 2 caracteres "HC"
      const idConRP = 'RP' + idPacienteSinHC; // Agregar "RP" al inicio
      console.log(idConRP); // Esto será lo que necesitas: "RPXXXXXXXXXXX"
    }
  }

  cargarDatosEstaticosGrafico(): void {
    this.pieChartData = {
      labels: this.tiposLeche,
      datasets: [{
        data: this.staticLecheData,
        backgroundColor: ['#ffcc80', '#80cbc4', '#a5d6a7', '#ef9a9a'],
        label: 'Cantidad Consumida',
      }]
    };
  }

  get hasChartData(): boolean {
    return !!this.pieChartData &&
           !!this.pieChartData.datasets &&
           !!this.pieChartData.datasets[0]?.data &&
           this.pieChartData.datasets[0].data.some((value: number) => value > 0);
  }
}