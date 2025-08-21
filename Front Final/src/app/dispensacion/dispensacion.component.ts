import { Component, HostListener, Injectable, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalLechePasteurizadaComponent } from '../components/modal-leche-pasteurizada/modal-leche-pasteurizada.component';
import { DispensacionService } from '../services/dispensacion.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Dispensacion, MilkTypeSelection, PaseDeVisita, RegistroLechePasteurizada } from '../model/dispensacion';
import { ModalFormulaMixtaComponent } from '../components/modal-formula-mixta/modal-formula-mixta.component';
import { ModalLecheMixtaComponent } from '../components/modal-leche-mixta/modal-leche-mixta.component';
import { ModalPasteurizadaFormulaComponent } from '../components/modal-pasteurizada-formula/modal-pasteurizada-formula.component';
import Swal from 'sweetalert2';
import { ModalLecheLMDComponent } from '../components/modal-leche-lmd/modal-leche-lmd.component';
import { ModalLecheFormulaAterminoComponent } from '../components/modal-leche-formula-atermino/modal-leche-formula-atermino.component';
import { ModalLecheAutologaComponent } from '../components/modal-leche-autologa/modal-leche-autologa.component';
import { ModalLecheFormulaPreterminoComponent } from '../components/modal-leche-formula-pretermino/modal-leche-formula-pretermino.component';
import { catchError, combineLatest, forkJoin, Observable, of, tap } from 'rxjs';
import { LecheFormulaService } from '../services/registroFormmula.service';

interface Milk {
  code: string;
  type: string;
  quantity: number;
  kcal: number;
  contenido: string;
  disabled?: boolean;
}
interface TimeSlot {
  hour: string;
  timeValue: number;
  selected: boolean;
  disabled: boolean;
  period: 'AM' | 'PM';
  locked: boolean; 
}

@Component({
  selector: 'app-dispensacion',
  templateUrl: './dispensacion.component.html',
  styleUrls: ['./dispensacion.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule,
    RouterModule
  ]
})
@Injectable({
  providedIn: 'root'
})
export default class DispensacionComponent implements OnInit {
  totalPasteurizada: number = 0;
totalFormula: number = 0;

selectedMilkTypes: MilkTypeSelection = {
  pasteurizada: false,
  autologaPasteurizada: false,
  lmd: false,
  autologa: false,
  autologaFormula: false,
  pasteurizadaFormula: false,
  formulaTermino1: false,
  formulaPretermino2: false,
  _locked: {
    pasteurizada: false,
    autologaPasteurizada: false,
    lmd: false,
    autologa: false,
    autologaFormula: false,
    pasteurizadaFormula: false,
    formulaTermino1: false,
    formulaPretermino2: false
  }
};

  dispensacionExistenteId: number | null = null;
   fechaActual: string = new Date().toLocaleDateString('en-CA');
  patientId = '';
  cunaId = '';
  ultimoPaseVisita?: PaseDeVisita;
  patientName = '';
  cunaNumber = '';
  selectedTomas = 0;
  cantidadPorToma = 0;
  showCalostroSection = false;
  disableColostrumCheckboxes = false;
  
  colostrum = {
    autologous: false,
    pasteurized: false
  };
  private initialDataLoaded = false;
  timeSlots: TimeSlot[] = [
  { hour: '12:00 pm', timeValue: 12, selected: false, disabled: false, period: 'PM', locked: false },
  { hour: '2:00 pm', timeValue: 14, selected: false, disabled: false, period: 'PM', locked: false },
  { hour: '3:00 pm', timeValue: 15, selected: false, disabled: false, period: 'PM', locked: false },
  { hour: '4:00 pm', timeValue: 16, selected: false, disabled: false, period: 'PM', locked: false },
  { hour: '6:00 pm', timeValue: 18, selected: false, disabled: false, period: 'PM', locked: false },
  { hour: '8:00 pm', timeValue: 20, selected: false, disabled: false, period: 'PM', locked: false },
  { hour: '9:00 pm', timeValue: 21, selected: false, disabled: false, period: 'PM', locked: false },
  { hour: '10:00 pm', timeValue: 22, selected: false, disabled: false, period: 'PM', locked: false },
  { hour: '12:00 am', timeValue: 0, selected: false, disabled: false, period: 'AM', locked: false },
  { hour: '2:00 am', timeValue: 2, selected: false, disabled: false, period: 'AM', locked: false },
  { hour: '3:00 am', timeValue: 3, selected: false, disabled: false, period: 'AM', locked: false },
  { hour: '4:00 am', timeValue: 4, selected: false, disabled: false, period: 'AM', locked: false },
  { hour: '6:00 am', timeValue: 6, selected: false, disabled: false, period: 'AM', locked: false },
  { hour: '8:00 am', timeValue: 8, selected: false, disabled: false, period: 'AM', locked: false },
  { hour: '9:00 am', timeValue: 9, selected: false, disabled: false, period: 'AM', locked: false },
  { hour: '10:00 am', timeValue: 10, selected: false, disabled: false, period: 'AM', locked: false }
];
onTimeSlotChange(timeSlot: TimeSlot, isSelected: boolean) {
  if (timeSlot.locked) {
    timeSlot.selected = !isSelected;
    return;
  }
    timeSlot.selected = isSelected;
  timeSlot.locked = true;
}
  milks: Milk[] = [];
  filteredPmSlots: TimeSlot[] = [];
  filteredAmSlots: TimeSlot[] = [];
  displayedColumns: string[] = ['code', 'type', 'quantity', 'kcal'];
  dispensacionesExistentes: Dispensacion[] = [];

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private dispensacionService: DispensacionService, 
    private router: Router,
    private lecheFormulaService: LecheFormulaService
  ) {
    Swal.fire({
      title: 'Cargando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
  }
  
  ngOnInit() {
    this.loadRouteParams();
    this.updateFilteredSlots();
      this.loadLecheFormula().subscribe();
     
  }

  setTomas(num: number) {
    this.selectedTomas = num;
    this.updateFilteredSlots();
  }

openModal(type: string) {
  if (this.selectedMilkTypes._locked?.[type as keyof typeof this.selectedMilkTypes._locked]) {
    return;
  }

  const component = this.getModalComponent(type);
  const data = { 
    cantidadInicial: this.cantidadPorToma,
    milks: this.milks,
    cantidadPorToma: this.cantidadPorToma,
    pacienteId: this.patientId  
  };
  
  const dialogRef = this.dialog.open(component, {
    width: '400px',
    data: data
  });
  
 dialogRef.afterClosed().subscribe(result => {
  this.loadLechePasteurizada();
  if (result) {
    this.handleModalResult(result);
    if (result.success) {
        switch (type) {
          case 'pasteurizada':
            this.selectedMilkTypes.pasteurizada = true;
            this.selectedMilkTypes._locked.pasteurizada = true;
            break;
          case 'autologa-pasteurizada':
            this.selectedMilkTypes.autologaPasteurizada = true;
            this.selectedMilkTypes._locked.autologaPasteurizada = true;
            break;
          case 'lmd':
            this.selectedMilkTypes.lmd = true;
            this.selectedMilkTypes._locked.lmd = true;
            break;
          case 'autologa':
            this.selectedMilkTypes.autologa = true;
            this.selectedMilkTypes._locked.autologa = true;
            break;
          case 'autologa-formula':
            this.selectedMilkTypes.autologaFormula = true;
            this.selectedMilkTypes._locked.autologaFormula = true;
            break;
          case 'pasteurizada-formula':
            this.selectedMilkTypes.pasteurizadaFormula = true;
            this.selectedMilkTypes._locked.pasteurizadaFormula = true;
            break;
          case 'formula-atermino':
            this.selectedMilkTypes.formulaTermino1 = true;
            this.selectedMilkTypes._locked.formulaTermino1 = true;
            break;
           case 'formula-pretermino':
            this.selectedMilkTypes.formulaPretermino2 = true;
            this.selectedMilkTypes._locked.formulaPretermino2 = true;
            break;
        }
      }

    }
});

}


  submitForm(): void {
    if (!this.ultimoPaseVisita?.idPaseVisita) {
      Swal.fire('Error', 'No se puede registrar sin un pase de visita válido', 'error');
      return;
    }
    
    const selectedSlots = this.timeSlots.filter(slot => slot.selected);
    const selectedMilkTypes = Object.keys(this.selectedMilkTypes)
      .filter(key => this.selectedMilkTypes[key as keyof MilkTypeSelection]);
    
    if (selectedSlots.length === 0 || selectedMilkTypes.length === 0) {
      Swal.fire('Advertencia', 'Seleccione al menos un horario y tipo de leche', 'warning');
      return;
    }
    
    Swal.fire({
      title: '¿Confirmar registro?',
      text: `¿Está seguro que desea registrar ${selectedSlots.length} dispensaciones?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) this.confirmSubmit();
    });
  }

 private loadRouteParams(): void {
    this.route.paramMap.subscribe(params => {
      this.patientId = params.get('idPaciente') || '';
      this.cunaId = params.get('idCuna') || '';
      
      if (!this.patientId || !this.cunaId) {
        this.router.navigate(['/ruta-de-error']);
        return;
      }

      this.loadNpoState();
      
      this.loadPatientData();
      
      this.loadUltimoPaseVisita();
    });
  }

  private loadPatientData(): void {
    if (!this.patientId) return;

    this.dispensacionService.getPaciente(this.patientId).subscribe({
      next: (paciente) => {
        this.patientName = paciente.nombrePaciente;
        this.cunaNumber = paciente.cuna.idCuna;
      },
      error: (err) => console.error('Error cargando paciente:', err)
    });
  }

private loadUltimoPaseVisita(): void {
  if (!this.patientId) return;

  Swal.fire({
    title: 'Cargando información...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  const hoy = new Date();
  const hoyLocal = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const hoyFormateado = this.formatDateToYYYYMMDD(hoyLocal);
 console.log('Fecha actual local:', hoyFormateado);

forkJoin([
    this.dispensacionService.getPasesVisita(this.patientId),
    this.dispensacionService.getDispensacionesPorPaciente(this.patientId)
  ]).subscribe({
    next: ([pases, dispensaciones]) => {
      console.log('Todos los pases recibidos:', pases);
      console.log('Todas las dispensaciones recibidas:', dispensaciones);
      const pasesHoy = pases.filter(pase => {
        if (!pase.fechaDia) return false;
        
        return pase.fechaDia === hoyFormateado;
      });

      console.log('Pases encontrados para hoy:', pasesHoy);
      if (pasesHoy.length === 0) {
        console.warn('No se encontraron pases para hoy');
        Swal.fire({
          title: 'Atención',
          text: 'Aún no se ha pasado visita hoy. Vuelva a intentarlo más tarde o comuníquese con su supervisor.',
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        }).then(() => this.router.navigate(['/pacientes']));
        return;
      }

 pasesHoy.sort((a, b) => b.idPaseVisita - a.idPaseVisita);
      this.ultimoPaseVisita = pasesHoy[0];
      
      console.log('Último pase de visita:', {
        id: this.ultimoPaseVisita.idPaseVisita,
        fecha: this.ultimoPaseVisita.fechaDia,
        tipoLeche: this.ultimoPaseVisita.tipoLecheRequerida,
        tomas: this.ultimoPaseVisita.nroDeTomasDeLeche
      });

      const dispensacionHoy = dispensaciones.find(d => d.fecha === hoyFormateado);

      if (dispensacionHoy) {
        console.log('Dispensación existente encontrada para hoy:', dispensacionHoy);
        this.dispensacionExistenteId = dispensacionHoy.idDispensacion || null;
        this.cargarDatosDispensacion(dispensacionHoy);
        Swal.close();
      } else {
        console.log('Creando nuevo formulario...');
        Swal.fire({
          title: 'Nuevo formulario',
          text: 'Se está creando un nuevo formulario... Espere por favor',
          icon: 'info',
          allowOutsideClick: false
        });
        
        this.dispensacionExistenteId = null;
        this.configurarFormularioConPase(this.ultimoPaseVisita);
        this.resetForm();
        Swal.close();
      }

      combineLatest([
        this.loadLechePasteurizada(),
        this.loadDispensacionesExistentes(),
        this.loadNpoState()
      ]).subscribe({
        next: () => {
          this.updateFilteredSlots();
          console.log('Formulario listo con datos:', {
            ultimoPase: this.ultimoPaseVisita,
            dispensacionExistenteId: this.dispensacionExistenteId,
            npoState: this.npo,
            milkTypes: this.selectedMilkTypes,
            timeSlots: this.timeSlots.filter(s => s.selected)
          });
        },
        error: (err) => {
          console.error('Error cargando datos:', err);
          Swal.close();
        }
      });
    },
    error: (err) => {
      console.error('Error cargando datos:', err);
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    }
  });
}

private formatDateToYYYYMMDD(date: Date): string {
  return date.toISOString().split('T')[0];
}
private cargarDatosDispensacion(dispensacion: Dispensacion): void {
  this.selectedMilkTypes = {
    pasteurizada: dispensacion.lechePasteurizada === 'Si',
    autologaPasteurizada: dispensacion.lecheAutologaPasteurizada === 'Si',
    lmd: dispensacion.ldm === 'Si',
    autologa: dispensacion.lecheAutologa === 'Si',
    autologaFormula: dispensacion.lecheAutologaFormula === 'Si',
    pasteurizadaFormula: dispensacion.lechePasteurizadaFormula === 'Si',
    formulaTermino1: dispensacion.lecheFormulaTermino === 'Si',
    formulaPretermino2: dispensacion.lecheFormulaPretermino === 'Si',
    _locked: { 
    pasteurizada: dispensacion.lechePasteurizada === 'Si',
    autologaPasteurizada: dispensacion.lecheAutologaPasteurizada === 'Si',
    lmd: dispensacion.ldm === 'Si',
    autologa: dispensacion.lecheAutologa === 'Si',
    autologaFormula: dispensacion.lecheAutologaFormula === 'Si',
    pasteurizadaFormula: dispensacion.lechePasteurizadaFormula === 'Si',
    formulaTermino1: dispensacion.lecheFormulaTermino === 'Si',
    formulaPretermino2: dispensacion.lecheFormulaPretermino === 'Si'
  }
  };

  this.cantidadPorToma = this.ultimoPaseVisita?.cantidadMlPorTomaDeLeche || 0;
  this.timeSlots.forEach(slot => slot.locked = false); // Inicializar como no bloqueado
  
  const tomaMap: {[key: number]: number} = {
    1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 22,
    7: 0, 8: 2, 9: 4, 10: 6, 11: 8, 12: 10
  };
if (!this.selectedMilkTypes._locked) {
    this.selectedMilkTypes._locked = {
      pasteurizada: false,
      autologaPasteurizada: false,
      lmd: false,
      autologa: false,
      autologaFormula: false,
      pasteurizadaFormula: false,
      formulaTermino1: false,
      formulaPretermino2: false
    };
  }
  this.selectedMilkTypes = {
    pasteurizada: dispensacion.lechePasteurizada === 'Si',
    autologaPasteurizada: dispensacion.lecheAutologaPasteurizada === 'Si',
    lmd: dispensacion.ldm === 'Si',
    autologa: dispensacion.lecheAutologa === 'Si',
    autologaFormula: dispensacion.lecheAutologaFormula === 'Si',
    pasteurizadaFormula: dispensacion.lechePasteurizadaFormula === 'Si',
    formulaTermino1: dispensacion.lecheFormulaTermino === 'Si',
    formulaPretermino2: dispensacion.lecheFormulaPretermino === 'Si',
    _locked: {
      pasteurizada: dispensacion.lechePasteurizada === 'Si',
      autologaPasteurizada: dispensacion.lecheAutologaPasteurizada === 'Si',
      lmd: dispensacion.ldm === 'Si',
      autologa: dispensacion.lecheAutologa === 'Si',
      autologaFormula: dispensacion.lecheAutologaFormula === 'Si',
      pasteurizadaFormula: dispensacion.lechePasteurizadaFormula === 'Si',
      formulaTermino1: dispensacion.lecheFormulaTermino === 'Si',
      formulaPretermino2: dispensacion.lecheFormulaPretermino === 'Si'
    }
  };
this.timeSlots.forEach(slot => {
    slot.selected = false;
    slot.locked = false;
  });

  for (let i = 1; i <= 12; i++) {
    const tomaKey = `toma${i}` as keyof Dispensacion;
    if (dispensacion[tomaKey] === 'Si') {
      const hora = tomaMap[i];
      const slotIndex = this.timeSlots.findIndex(s => s.timeValue === hora);
      if (slotIndex !== -1) {
        this.timeSlots[slotIndex].selected = true;
        this.timeSlots[slotIndex].locked = true;
      }
    }
  }
}
  private configurarFormularioConPase(pase: PaseDeVisita): void {
  this.showCalostroSection = pase.calostroterapia === 'Si';
  this.disableColostrumCheckboxes = pase.calostroterapia === 'No';
  
  if (pase.calostroterapia === 'No') {
    this.colostrum = { autologous: false, pasteurized: false };
  }

  this.selectedTomas = pase.nroDeTomasDeLeche;
  this.cantidadPorToma = pase.cantidadMlPorTomaDeLeche;
  
  if (pase.tipoLecheRequerida) {
    this.selectedMilkTypes = this.parseTiposLeche(pase.tipoLecheRequerida);
  }
}
  private parseTiposLeche(tipos: string[]): MilkTypeSelection {
  return {
    pasteurizada: tipos.includes('PASTEURIZADA'),
    autologaPasteurizada: tipos.includes('AUTOLOGA_PASTEURIZADA'),
    lmd: tipos.includes('LMD'),
    autologa: tipos.includes('AUTOLOGA'),
    autologaFormula: tipos.includes('AUTOLOGA_FORMULA'),
    pasteurizadaFormula: tipos.includes('PASTEURIZADA_FORMULA'),
    formulaTermino1: tipos.includes('FORMULA_TERMINO1'),
    formulaPretermino2: tipos.includes('FORMULA_PRETERMINO2'),
    _locked: { // Propiedad añadida
      pasteurizada: false,
      autologaPasteurizada: false,
      lmd: false,
      autologa: false,
      autologaFormula: false,
      pasteurizadaFormula: false,
      formulaTermino1: false,
      formulaPretermino2: false
    }
  };
}

private loadDispensacionesExistentes(): Observable<any> {
  return this.dispensacionService.getDispensacionesActivas(this.patientId).pipe(
    tap(dispensaciones => {
      this.dispensacionesExistentes = dispensaciones;
      this.popularFormularioConDatosExistentes();
    }),
    catchError(err => {
      console.error('Error cargando dispensaciones:', err);
      return of(null);
    })
  );
}
  private popularFormularioConDatosExistentes(): void {
    this.dispensacionesExistentes.forEach(disp => {
    this.selectedMilkTypes = {
      pasteurizada: disp.lechePasteurizada === 'Si',
      autologaPasteurizada: disp.lecheAutologaPasteurizada === 'Si',
      lmd: disp.ldm === 'Si',
      autologa: disp.lecheAutologa === 'Si',
      autologaFormula: disp.lecheAutologaFormula === 'Si',
      pasteurizadaFormula: disp.lechePasteurizadaFormula === 'Si',
      formulaTermino1: disp.lecheFormulaTermino === 'Si',
      formulaPretermino2: disp.lecheFormulaPretermino === 'Si',
      _locked: { // Propiedad añadida
        pasteurizada: false,
        autologaPasteurizada: false,
        lmd: false,
        autologa: false,
        autologaFormula: false,
        pasteurizadaFormula: false,
        formulaTermino1: false,
        formulaPretermino2: false
      }
    };

      for (let i = 1; i <= 12; i++) {
        const tomaKey = `toma${i}` as keyof Dispensacion;
        if (disp[tomaKey] === 'Si') {
          const slotIndex = this.timeSlots.findIndex(s => s.timeValue === this.getHourForToma(i));
          if (slotIndex !== -1) this.timeSlots[slotIndex].selected = true;
        }
      }
    });
  }

  private getHourForToma(tomaNumber: number): number {
    const hourMap: { [key: number]: number } = {
      1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 22,
      7: 0, 8: 2, 9: 4, 10: 6, 11: 8, 12: 10
    };
    return hourMap[tomaNumber] || 0;
  }

private loadLechePasteurizada(): Observable<any> {
  if (!this.ultimoPaseVisita) {
    return of(null); 
  }

  return this.dispensacionService.getAllLechePasteurizada().pipe(
   tap((data) => {
  let tiposRequeridos: string[] = [];
  if (Array.isArray(this.ultimoPaseVisita!.tipoLecheRequerida)) {
    tiposRequeridos = this.ultimoPaseVisita!.tipoLecheRequerida;
  } else if (typeof this.ultimoPaseVisita!.tipoLecheRequerida === 'string') {
    tiposRequeridos = [this.ultimoPaseVisita!.tipoLecheRequerida];
  }

  const lechesFiltradas = data.filter(leche =>
    tiposRequeridos.length === 0 || 
    tiposRequeridos.some(tipo => this.coincideTipoLeche(leche.tipoLeche, tipo))
  );

  this.milks = lechesFiltradas.map(leche => ({
    code: leche.codigoLeche,
    type: leche.tipoLeche,
    quantity: leche.cantidadLeche,
    kcal: leche.kcal,
    contenido: leche.contenidoEnergetico || 'N/A',
    disabled: this.npo
    
  }));

  this.totalPasteurizada = lechesFiltradas.reduce(
    (total, leche) => total + Number(leche.cantidadLeche), 0
  );
   this.checkStockPasteurizada();
  console.log('Cantidad total de leche pasteurizada:', this.totalPasteurizada);
  console.log('Milks cargadas:', this.milks);

}),
    catchError(err => {
      console.error('Error cargando leche pasteurizada:', err);
      Swal.fire('Error', 'No se pudieron cargar las leches', 'error');
      return of([]); 
    })
  );
  
}


  private coincideTipoLeche(tipoLeche: string, tipoRequerido: string): boolean {
    const equivalencias: Record<string, string[]> = {
      'Calostro': ['Calostro', 'CALOSTRO'],
      'Transicion': ['Transicion', 'TRANSICION'],
      'Madura': ['Madura', 'MADURA'],
    };

    const tiposEquivalentes = equivalencias[tipoRequerido] || [tipoRequerido];
    return tiposEquivalentes.some(
      equiv => tipoLeche.toLowerCase().includes(equiv.toLowerCase())
    );
  }

  private updateFilteredSlots() {
    if (!this.ultimoPaseVisita) return;
    
    const numTomas = this.ultimoPaseVisita.nroDeTomasDeLeche;
    const enabledTimes = this.getEnabledTimeSlots(numTomas);
    
    this.filteredPmSlots = this.timeSlots.filter(slot => 
      slot.timeValue >= 12 && slot.timeValue <= 23 && enabledTimes.includes(slot.timeValue)
    );
    
    this.filteredAmSlots = this.timeSlots.filter(slot => 
      slot.timeValue >= 0 && slot.timeValue < 12 && enabledTimes.includes(slot.timeValue)
    );
  }

  private getEnabledTimeSlots(numTomas: number): number[] {
    switch(numTomas) {
      case 4: return [12, 18, 0, 6];
      case 6: return [12, 16, 20, 0, 4, 8];
      case 8: return [12, 15, 18, 21, 0, 3, 6, 9];
      case 12: return [12, 14, 16, 18, 20, 22, 0, 2, 4, 6, 8, 10];
      default: return [];
    }
  }

  private handleModalResult(result: any) {
    if (result.success) {
      Swal.fire({
        title: '¡Registro exitoso!',
        text: `Se ha registrado ${result.quantity}ml de leche`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
      
      if (result.code) {
        this.milks = this.milks.filter(m => m.code !== result.code);
      }
    }
  }

  private getModalComponent(type: string): any {
    const components: Record<string, any> = {
      'pasteurizada': ModalLechePasteurizadaComponent,
      'autologa-pasteurizada': ModalLecheMixtaComponent,
      'autologa-formula': ModalFormulaMixtaComponent,
      'pasteurizada-formula': ModalPasteurizadaFormulaComponent,
      'lmd': ModalLecheLMDComponent,
      'formula-atermino': ModalLecheFormulaAterminoComponent,
      'autologa': ModalLecheAutologaComponent,
      'formula-pretermino': ModalLecheFormulaPreterminoComponent
    };
    return components[type] || null;
  }
private confirmSubmit(): void {
  if (!this.ultimoPaseVisita || !this.patientId) {
    Swal.fire('Error', 'Datos requeridos faltantes', 'error');
    return;
  }

  const nuevaDispensacion: Dispensacion = {
    idDispensacion: this.dispensacionExistenteId || undefined,
    paseDeVisita: { idPaseVisita: Number(this.ultimoPaseVisita.idPaseVisita) },
    idPaciente: this.patientId,
    fecha: this.fechaActual,
    ...this.mapSelectedMilkTypes(),
    ...this.mapSelectedTimeSlots(),
  };

  console.log("Datos a enviar al backend:", {
    operacion: this.dispensacionExistenteId ? "ACTUALIZAR" : "CREAR",
    dispensacionId: this.dispensacionExistenteId || "NUEVO_REGISTRO",
    fechaActual: this.fechaActual,
    payload: JSON.parse(JSON.stringify(nuevaDispensacion)) 
  });

  const selectedSlots = this.timeSlots.filter(slot => slot.selected);
  console.log("Horarios seleccionados:", {
    total: selectedSlots.length,
    slots: selectedSlots.map(slot => slot.hour)
  });

  console.log(" Tipos de leche seleccionados:", 
    Object.entries(this.selectedMilkTypes)
      .filter(([_, value]) => value)
      .map(([key]) => key)
  );

  Swal.fire({ title: 'Registrando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  const dispensacionObservable = this.dispensacionExistenteId 
    ? this.dispensacionService.updateDispensacion(this.dispensacionExistenteId, nuevaDispensacion)
    : this.dispensacionService.createDispensacion(nuevaDispensacion);

  dispensacionObservable.subscribe({
    next: (resp) => {
      console.log("Respuesta del backend:", resp);
      this.dispensacionExistenteId = resp.idDispensacion || this.dispensacionExistenteId;
     Swal.fire({
        title: '¡Éxito!',
        text: `Dispensación ${this.dispensacionExistenteId ? 'actualizada' : 'registrada'}`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.router.navigate(['/pacientes']); 
      });
      this.resetForm();
    },
    error: (err) => {
      console.error("Error del backend:", err); 
      Swal.fire('Error', err.error?.message || 'Error al registrar', 'error');
    }
  });
}
  private mapSelectedMilkTypes(): Partial<Dispensacion> {
    return {
      lechePasteurizada: this.selectedMilkTypes.pasteurizada ? 'Si' : 'No',
      ldm: this.selectedMilkTypes.lmd ? 'Si' : 'No',
      lecheAutologaFormula: this.selectedMilkTypes.autologaFormula ? 'Si' : 'No',
      lecheFormulaTermino: this.selectedMilkTypes.formulaTermino1 ? 'Si' : 'No',
      lecheAutologaPasteurizada: this.selectedMilkTypes.autologaPasteurizada ? 'Si' : 'No',
      lecheAutologa: this.selectedMilkTypes.autologa ? 'Si' : 'No',
      lechePasteurizadaFormula: this.selectedMilkTypes.pasteurizadaFormula ? 'Si' : 'No',
      lecheFormulaPretermino: this.selectedMilkTypes.formulaPretermino2 ? 'Si' : 'No'
    };
  }

  private mapSelectedTimeSlots(): Partial<Dispensacion> {
    const result: Partial<Dispensacion> = {};
    let firstSelectedToma: number | undefined;

    for (let i = 1; i <= 12; i++) {
      (result as any)[`toma${i}`] = 'No';
    }


    this.timeSlots.forEach((slot) => {
      const tomaMap: Record<number, number> = {
        12: 1, 14: 2, 16: 3, 18: 4, 20: 5, 22: 6,
        0: 7, 2: 8, 4: 9, 6: 10, 8: 11, 10: 12
      };
      
      const tomaNumber = tomaMap[slot.timeValue];
      if (slot.selected && tomaNumber) {
        (result as any)[`toma${tomaNumber}`] = 'Si';
        if (firstSelectedToma === undefined) firstSelectedToma = tomaNumber;
      }
    });

    result.nroToma = firstSelectedToma;
    return result;
  }

  private resetForm(): void {
     this.timeSlots.forEach(slot => {
    slot.selected = false;
    slot.locked = false;
  });

    this.npo = false;
     this.selectedMilkTypes = {
    pasteurizada: false,
    autologaPasteurizada: false,
    lmd: false,
    autologa: false,
    autologaFormula: false,
    pasteurizadaFormula: false,
    formulaTermino1: false,
    formulaPretermino2: false,
    _locked: {
      pasteurizada: false,
      autologaPasteurizada: false,
      lmd: false,
      autologa: false,
      autologaFormula: false,
      pasteurizadaFormula: false,
      formulaTermino1: false,
      formulaPretermino2: false
    }
  };
    Object.keys(this.modalOpenedStates).forEach(key => {
    this.modalOpenedStates[key] = false;
  });
  }

 private saveFormState(): void {
    localStorage.setItem(`npoState_${this.patientId}`, JSON.stringify(this.npo));
  }


private updateMilkDisabledState(): void {
  if (this.milks) {
    this.milks.forEach(m => m.disabled = this.npo);
  }
}


private loadNpoState(): Observable<void> {
  return new Observable(observer => {
    if (!this.patientId) {
      observer.complete();
      return;
    }

    const savedNPO = localStorage.getItem(`npoState_${this.patientId}`);
    console.log('localStorage - Estado NPO:', {
      key: `npoState_${this.patientId}`,
      value: savedNPO,
      paciente: this.patientId
    });

    if (savedNPO !== null) {
      try {
        this.npo = JSON.parse(savedNPO);
        console.log('Estado NPO cargado:', this.npo);
      } catch (e) {
        console.error('Error al parsear estado NPO:', e);
        this.npo = false;
      }
    }
    
    this.updateMilkDisabledState();
    observer.next();
    observer.complete();
  });
}

public modalOpenedStates: { [key: string]: boolean } = {
  pasteurizada: false,
  autologaPasteurizada: false,
  lmd: false,
  autologa: false,
  autologaFormula: false,
  pasteurizadaFormula: false,
  formulaTermino1: false,
  formulaPretermino2: false
};
private saveNpoState(): void {
  if (!this.patientId) return;

  const key = `npoState_${this.patientId}`;
  const value = JSON.stringify(this.npo);
  
  localStorage.setItem(key, value);
  
  console.log('localStorage - Guardando NPO:', {
    key,
    value,
    paciente: this.patientId,
    timestamp: new Date().toISOString()
  });
}
private _npo = false;

get npo(): boolean {
  return this._npo;
}

set npo(value: boolean) {
  this._npo = value;
  this.updateMilkDisabledState();
  this.saveNpoState();
}
@HostListener('window:beforeunload')
beforeUnloadHandler() {
  this.saveFormState();
}
private loadLecheFormula(): Observable<any> {
  return this.lecheFormulaService.findAll().pipe(
    tap((data) => {
      this.totalFormula = data.reduce((total: number, formula: any) => {
        const cantidad = Number(formula.cantidadFormula);
        return total + (!isNaN(cantidad) ? cantidad : 0);
      }, 0);

      console.log('Cantidad total de leche fórmula:', this.totalFormula);
    }),
    catchError(err => {
      console.error('Error cargando fórmula:', err);
      Swal.fire('Error', 'No se pudo cargar la leche fórmula', 'error');
      return of([]);
    })
  );
}
checkStockFormula(): void {
  if (this.totalFormula <= 400) {
    Swal.fire({
      icon: 'warning',
      title: '¡Atención!',
      text: 'Queda poco stock en el almacén de leche fórmula.',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#d33'
    });
  }
}
checkStockPasteurizada(): void {
  if (this.totalPasteurizada <= 400) {
    Swal.fire({
      icon: 'warning',
      title: '¡Stock bajo!',
      text: 'Queda poco stock en el almacén de leche pasteurizada con las necesidades de este paciente.',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#d33'
    });
  }
}
onMilkTypeCheckboxClick(event: Event, type: string) {
  // Verificar bloqueo usando switch
  let isLocked = false;
  switch (type) {
    case 'pasteurizada': isLocked = this.selectedMilkTypes._locked.pasteurizada; break;
    case 'autologaPasteurizada': isLocked = this.selectedMilkTypes._locked.autologaPasteurizada; break;
    // ... otros casos ...
  }

  if (isLocked || this.npo) {
    event.preventDefault();
    return;
  }
  
  event.preventDefault();
  this.openModal(type);
}
onPasteurizedCheckboxChange(event: any) {
  const isLocked = this.selectedMilkTypes._locked.pasteurizada;
  
  if (isLocked || this.npo) {
    // Revertir el cambio si está bloqueado o NPO
    event.source.checked = this.selectedMilkTypes.pasteurizada;
    return;
  }

  // Solo abrir modal si no está bloqueado
  if (!isLocked && !this.npo && event.checked) {
    this.openModal('pasteurizada');
    // Revertir temporalmente hasta confirmación
    event.source.checked = false;
  } else {
    // Mantener estado actual si no se abre modal
    event.source.checked = this.selectedMilkTypes.pasteurizada;
  }
}
onAutologaPasteurizadaCheckboxChange(event: any) {
  const isLocked = this.selectedMilkTypes._locked.autologaPasteurizada;
  
  if (isLocked || this.npo) {
    event.source.checked = this.selectedMilkTypes.autologaPasteurizada;
    return;
  }

  if (!isLocked && !this.npo && event.checked) {
    this.openModal('autologa-pasteurizada');
    event.source.checked = false;
  }  
   else {
    event.source.checked = this.selectedMilkTypes.pasteurizada;
  }
}
onLmdCheckboxChange(event: any) {
  const isLocked = this.selectedMilkTypes._locked.lmd;
  
  if (isLocked || this.npo) {
    event.source.checked = this.selectedMilkTypes.lmd;
    return;
  }

  if (!isLocked && !this.npo && event.checked) {
    this.openModal('lmd');
    event.source.checked = false;
  }else {
    event.source.checked = this.selectedMilkTypes.lmd ;
  }
}
onAutologaCheckboxChange(event: any) {
  const isLocked = this.selectedMilkTypes._locked.autologa;
  
  if (isLocked || this.npo) {
    event.source.checked = this.selectedMilkTypes.autologa;
    return;
  }
  if (!isLocked && !this.npo && event.checked) {
    this.openModal('autologa');
    event.source.checked = false;
  }else {
    event.source.checked = this.selectedMilkTypes.autologa;
  }
}
onAutologaFormulaCheckboxChange(event: any) {
  const isLocked = this.selectedMilkTypes._locked.autologaFormula;
  
  if (isLocked || this.npo) {
    // Revertir el cambio si está bloqueado o NPO
    event.source.checked = this.selectedMilkTypes.autologaFormula;
    return;
  }
  if (!isLocked && !this.npo && event.checked) {
    this.openModal('autologa-formula');
    // Revertir temporalmente hasta confirmación
    event.source.checked = false;
  }else {
    event.source.checked = this.selectedMilkTypes.autologaFormula;
  }
}
onPasteurizadaFormulaCheckboxChange(event: any) {
  const isLocked = this.selectedMilkTypes._locked.pasteurizadaFormula;
  
  if (isLocked || this.npo) {
    event.source.checked = this.selectedMilkTypes.pasteurizadaFormula;
    return;
  }

  if (!isLocked && !this.npo && event.checked) {
    this.openModal('pasteurizada-formula');
    event.source.checked = false;
  }else {
    event.source.checked = this.selectedMilkTypes.pasteurizadaFormula;
  }
}
// En DispensacionComponent
onFormulaTermino1CheckboxChange(event: any) {
  const isLocked = this.selectedMilkTypes._locked.formulaTermino1;
  
  if (isLocked || this.npo) {
    event.source.checked = this.selectedMilkTypes.formulaTermino1;
    return;
  }
  if (!isLocked && !this.npo && event.checked) {
    this.openModal('formula-atermino');
    event.source.checked = false;
  }else {
    event.source.checked = this.selectedMilkTypes.formulaTermino1;
  }
}
onFormulaPretermino2CheckboxChange(event: any) {
  const isLocked = this.selectedMilkTypes._locked.formulaPretermino2;
  
  if (isLocked || this.npo) {
    event.source.checked = this.selectedMilkTypes.formulaPretermino2;
    return;
  }

  if (!isLocked && !this.npo && event.checked) {
    this.openModal('formula-pretermino');
    event.source.checked = false;
  }else {
    event.source.checked = this.selectedMilkTypes.formulaPretermino2;
  }
}
}