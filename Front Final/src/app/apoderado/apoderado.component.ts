import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApoderadoService } from '../services/apoderado.service';
import { Apoderado} from '../model/apoderado.interface';
import { MadreService } from '../services/madre.service';
import { Madre } from '../model/madre.interface';// Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-apoderado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apoderado.component.html',
  styleUrls: ['./apoderado.component.css']
})

export default class ApoderadoComponent implements OnInit {
  private madreService = inject(MadreService);
  private apoderadoService = inject(ApoderadoService);
  private route = inject(ActivatedRoute);

  idMadre: string | null = null;

  apoderado: Apoderado = {
    idApoderado: '',
    parentesco: '',
    nombreApoderado: '',
    apellidoPaternoApoderado: '',
    apellidoMaternoApoderado: '',
    madre: {
      idMadre: '',
    }
  };
  

  ngOnInit(): void {
    this.idMadre = this.route.snapshot.paramMap.get('idMadre');
    if (this.idMadre) {
      this.madreService.getById(this.idMadre).subscribe({
        next: (madreData: any) => {
          this.apoderado.madre = madreData as Madre;
          this.apoderado.madre.idMadre = this.idMadre!; // Asegura que esté asignado
        },
        error: (err) => {
          console.error('❌ Error al obtener madre:', err);
        }
      });
    }
  }
  
  

  guardarApoderado() {
    console.log('Registrando apoderado:', this.apoderado);
    this.apoderadoService.create(this.apoderado).subscribe({
      next: (res) => console.log('✅ Apoderado guardado:', res),
      error: (err) => console.error('❌ Error al guardar apoderado:', err)
    });
  }

  goBack() {
    window.history.back();
  }
}