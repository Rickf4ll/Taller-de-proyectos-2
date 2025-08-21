import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Enfermedad } from '../model/enfermedad.interface';
import { EnfermedadespacienteService } from '../services/enfermedadespaciente.service';
import { EnfermedadesPaciente } from '../model/enfermedadespaciente.interface';
import { EnfermedadService } from '../services/enfermedad.service';
import { CommonModule } from '@angular/common';
import { DiagnosticoPacienteService } from '../services/diagnosticopaciente.service';
import { DiagnosticoPaciente } from '../model/paciente.interface';

@Component({
  standalone: true,
  selector: 'app-enfermedades-paciente',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './enfermedades-paciente.component.html',
  styleUrl: './enfermedades-paciente.component.css'
})
export default class EnfermedadesPacienteComponent implements OnInit {
  private enfermedadesPacienteService = inject(EnfermedadespacienteService);
  private enfermedadService = inject(EnfermedadService);
  private diagnosticoPacienteService = inject(DiagnosticoPacienteService);
  fb = inject(FormBuilder);
  router = inject(Router);
  route = inject(ActivatedRoute);

  categoriasDisponibles: string[] = ['Gastrointestinales', 'Respiratorios', 'Infecciosos', 'Otros'];
  categoriaSeleccionada: string = '';
  enfermedadesPorCategoria: { [categoria: string]: Enfermedad[] } = {};
  diagnosticoPacienteDisponibles: DiagnosticoPaciente[] = [];
  diagnosticoPaciente: DiagnosticoPaciente | null = null;

  ultimoIdEnfermedad: string = '';
  ultimoIdEnfermedadPaciente = '';
  enfermedadForm!: FormGroup;
  enfermedadSeleccionada: { [categoria: string]: Enfermedad | null } = {
    gastrointestinales: null,
    respiratorios: null,
    infecciosos: null,
    otros: null
  };

  mostrarModalEnfermedad = false;

  ngOnInit(): void {
    this.cargarEnfermedadesDesdeBD();
    // Formulario reactivo para el modal
    const idDiagnosticoPaciente = this.route.snapshot.paramMap.get('idDiagnosticoPaciente');
    if (idDiagnosticoPaciente) {
      this.diagnosticoPacienteService.obtenerPorId(idDiagnosticoPaciente).subscribe((diagnostico) => {
        this.diagnosticoPaciente = diagnostico;
      });
    } else {
      alert('No se encontró el ID del diagnóstico en la URL.');
    }
    

    this.enfermedadForm = this.fb.group({
      nombreEnfermedad: ['', Validators.required],
      categoriaEnfermedad: ['', Validators.required]
    });
  }

  cargarEnfermedadesDesdeBD() {
    this.enfermedadService.listarTodas().subscribe((enfermedades) => {
      this.enfermedadesPorCategoria = enfermedades.reduce((acc, enfermedad) => {
        const categoria = enfermedad.categoriaEnfermedad.toLowerCase();
        if (!acc[categoria]) {
          acc[categoria] = [];
        }
        acc[categoria].push(enfermedad);
        return acc;
      }, {} as { [categoria: string]: Enfermedad[] });

      this.categoriasDisponibles = Object.keys(this.enfermedadesPorCategoria);

      const ids = enfermedades.map(e => e.idEnfermedad);
      this.ultimoIdEnfermedad = this.obtenerSiguienteId(ids);
    });
  }
  terminar(){
    this.router.navigate(['/menu-historia']);
  }
  obtenerSiguienteId(ids: string[]): string {
    const numeros = ids
      .filter(id => /^E\d+$/.test(id))
      .map(id => parseInt(id.substring(1), 10));
    const max = Math.max(...numeros, 0);
    const siguiente = max + 1;
    return `E${siguiente.toString().padStart(3, '0')}`;
  }

  obtenerSiguienteIdEnfermedadPaciente(ids: string[]): string {
    const numeros = ids
      .filter(id => /^EP\d+$/.test(id))
      .map(id => parseInt(id.substring(2), 10));
    const max = Math.max(...numeros, 0);
    const siguiente = max + 1;
    return `EP${siguiente.toString().padStart(5, '0')}`;
  }

  abrirModal() {
    this.enfermedadForm.reset();
    this.mostrarModalEnfermedad = true;

  }

  cerrarModal() {
    this.mostrarModalEnfermedad = false;
  }

  guardarEnfermedadDesdeModal() {
    const nombre = this.enfermedadForm.get('nombreEnfermedad')?.value?.trim();
    const categoriaInput = this.enfermedadForm.get('categoriaEnfermedad')?.value;

    const categoria = categoriaInput.charAt(0).toUpperCase() + categoriaInput.slice(1).toLowerCase(); // 💡 transforma "otros" → "Otros"

    if (nombre && categoria) {
      const nuevaEnfermedad: Enfermedad = {
        idEnfermedad: this.ultimoIdEnfermedad,
        nombreEnfermedad: nombre,
        categoriaEnfermedad: categoria
      };

      this.enfermedadService.guardar(nuevaEnfermedad).subscribe((enfermedad) => {
        if (enfermedad) {
          this.cargarEnfermedadesDesdeBD();
          this.cerrarModal();
        }
      });
    } else {
      alert('Por favor completa todos los campos.');
    }
  }
  guardarEnfermedadSeleccionada(categoria: string) {
    const enfermedad = this.enfermedadSeleccionada[categoria];

    if (!enfermedad || !this.diagnosticoPaciente) {
      alert('Falta información para guardar la enfermedad.');
      return;
    }

    this.enfermedadesPacienteService.listarTodas().subscribe((todas) => {


      const nuevoRegistro: EnfermedadesPaciente = {
        enfermedad: { idEnfermedad: enfermedad.idEnfermedad },
        diagnosticoPaciente: { idDiagnosticoPaciente: this.diagnosticoPaciente!.idDiagnosticoPaciente }
      };
      
  

      this.enfermedadesPacienteService.guardar(nuevoRegistro).subscribe(() => {
        alert('Enfermedad registrada con éxito.');
        this.enfermedadSeleccionada[categoria] = null;
      });
    });
  }


}
