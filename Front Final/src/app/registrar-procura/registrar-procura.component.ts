import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DonadoraService } from '../services/donadora.service';
import { API_URL } from '../conexion';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrar-procura',
  imports: [FormsModule,CommonModule,ReactiveFormsModule,RouterLink],
  standalone: true,
  templateUrl: './registrar-procura.component.html',
  styleUrl: './registrar-procura.component.css'
})
export default class RegistrarProcuraComponent {
  form: FormGroup;
  searchDNI: string = '';
  idDonadora: string = '';
  fotosBase64: string[] = [];
  selectedFile: File | null = null;
  consentimientoBase64: string | null = null;

  mostrarImagen: boolean = false;
  donadoraConsentimientoUrl: string | null = null;
  donadoraData: any; // Para almacenar los datos completos de la donadora
  
  sections = {
    personal: true,
    contacto: false,
    salud: false,
    pruebas: false,
    adicional: false
  };

  constructor(
    private fb: FormBuilder,
    private donadoraService: DonadoraService,
    private router: Router,
    private route: ActivatedRoute,
  ) 
  {
    console.log('Constructor - idDonadora:', this.route.snapshot.paramMap.get('id'));
    this.idDonadora = this.route.snapshot.paramMap.get('id') || '';
    this.form = this.createForm();
    console.log('Constructor - Formulario creado:', this.form.value);
  }

  ngOnInit(): void {
    console.log('ngOnInit - Iniciando carga de datos');
    this.loadDonadoraData();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      idDonadora: [{value: this.idDonadora, disabled: true}, [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      nombreDonadora: ['', Validators.required],
      apellidoPaternoDonadora: ['', Validators.required],
      apellidoMaternoDonadora: [''],
      fechaNacimientoDonadora: ['', Validators.required],
      telefonoDonadora: ['', [Validators.pattern('^[0-9]{9}$')]],
      tallaDonadora: [null],
      departamento: [''],
      provincia: [''],
      distrito: [''],
      direccionActualDonadora: [''],
      centroSaludControlProcedencia: [''],
      numeroControles: [null],
      ocupacion: [''],
      transfusionSangreMadre: [''],
      consumoCigarros: [''],
      consumoDrogas: [''],
      consumoMedicamentos: [''],
      enfermedades: [''],
      pruebaSerologicos: [''],
      pruebaSifilis: [''],
      pruebaHepatitis: [''],
      pruebaVIH: [''],
      examenHemoglobina: [''],
      enfermedadActual: [''],
      donarLeche: [''],
      aptaParaDonar: ['']
  });
    
  
  }

  private loadDonadoraData(): void {
    if (this.idDonadora) {
      this.donadoraService.getDonadoraById(this.idDonadora).subscribe({
        next: (donadora) => {
          if (donadora) {
            console.log(donadora);
            this.donadoraData = donadora; // Guardamos los datos completos
            
            const datos = {
              ...donadora,
              fechaNacimientoDonadora: donadora.fechaNacimientoDonadora 
                ? new Date(donadora.fechaNacimientoDonadora).toISOString().split('T')[0]
                : ''
            };
            
            this.form.patchValue(datos);
            this.disableTextInputs();
            
            // Si hay consentimiento, preparamos la URL
            if (donadora.consentimientoDonadora) {
              this.prepararUrlConsentimiento(donadora.consentimientoDonadora);
            }
          }
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Error al cargar datos');
        }
      });
    }
  }
  mostrarConsentimiento(): void {
    if (this.donadoraData?.consentimientoDonadora) {
        this.prepararUrlConsentimiento(this.donadoraData.consentimientoDonadora);
        if (this.donadoraConsentimientoUrl) {
            window.open(this.donadoraConsentimientoUrl, '_blank');
        }
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No se encontró el consentimiento",
        footer: "Por favor, asegúrate de que la donadora tenga un consentimiento registrado."
      });
    }
}
  prepararUrlConsentimiento(path: string): void {
    const cleanPath = path.replace(/\\/g, '/');
    const parts = cleanPath.split('/');
    const fileName = parts[parts.length - 1]; // ya contiene: 88888888_1745589713...jpg
  
    const encodedFileName = encodeURIComponent(fileName);
  
    // Solo usa fileName sin repetir idDonadora
    this.donadoraConsentimientoUrl = 
      `${API_URL}/donadoras/${this.idDonadora}/consentimiento/${encodedFileName}`;
  
    console.log('URL generada para consentimiento:', this.donadoraConsentimientoUrl);
  }
  
 
  async tomarFoto() {
    console.log('tomarFoto - Iniciando captura de foto');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        this.consentimientoBase64 = canvas.toDataURL('image/jpeg');
        console.log('tomarFoto - Foto tomada y convertida a base64:', this.consentimientoBase64?.substring(0, 50) + '...');
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.error('tomarFoto - Error al tomar la foto:', error);
      alert('Error al acceder a la cámara');
    }
  }

  toggleSection(section: keyof typeof this.sections): void {
    console.log('toggleSection - Sección antes del cambio:', this.sections);
    this.sections[section] = !this.sections[section];
    console.log('toggleSection - Sección después del cambio:', this.sections);
  }
  
  onFileSelected(event: any): void {
    console.log('onFileSelected - Evento de selección de archivo:', event);
    const file = event.target.files[0];
    if (file) {
      console.log('onFileSelected - Archivo seleccionado:', file.name, file.size, file.type);
      const reader = new FileReader();
      reader.onload = () => {
        this.consentimientoBase64 = reader.result as string;
        console.log('onFileSelected - Archivo convertido a base64:', this.consentimientoBase64?.substring(0, 50) + '...');
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    console.group('Enviando formulario');
    console.log('Estado del formulario (valid, invalid):', this.form.valid, this.form.invalid);
    console.log('Valores completos del formulario:', this.form.getRawValue());
    
    if (this.form.valid) {
        const formData = new FormData();
        const rawData = this.form.getRawValue();
        
        // Convertir fecha al formato ISO
        if (rawData.fechaNacimientoDonadora) {
            const fechaOriginal = rawData.fechaNacimientoDonadora;
            rawData.fechaNacimientoDonadora = new Date(fechaOriginal).toISOString();
            console.log(`Fecha convertida: ${fechaOriginal} -> ${rawData.fechaNacimientoDonadora}`);
        }

        console.log('Datos a enviar:', rawData);
        
    
        Object.keys(rawData).forEach(key => {
            if (key !== 'consentimiento') {
                const value = rawData[key];
                console.log(`Procesando campo ${key}:`, value);
                if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            }
        });

        // Manejar el consentimiento
        if (this.consentimientoBase64) {
            console.log('Preparando consentimiento para enviar');
            const blob = this.dataURItoBlob(this.consentimientoBase64);
            formData.append('consentimientoDonadora', blob, 'consentimiento.jpg');
            console.log('Consentimiento añadido al FormData');
        } else {
            console.warn('No hay consentimiento para enviar');
        }

        console.log('Enviando datos al servidor...');
        this.donadoraService.updateDonadora(this.idDonadora, formData).subscribe({
            next: (response) => {
                console.groupCollapsed('Respuesta del servidor');
                console.log('Respuesta completa:', response);
                console.groupEnd();
                alert('Donadora actualizada exitosamente');
                this.router.navigate(['/donantes']);
            },
            error: (error) => {
                console.group('Error en la solicitud');
                console.error('Error completo:', error);
                console.error('Detalles del error:', {
                    message: error.message,
                    status: error.status,
                    url: error.url,
                    error: error.error
                });
                console.groupEnd();
                alert('Error al actualizar la donadora');
            },
            complete: () => {
                console.log('Solicitud completada');
            }
        });
    } else {
        console.error('Formulario inválido. Errores:', this.form.errors);
        console.log('Estado de cada campo:');
        Object.keys(this.form.controls).forEach(key => {
            const control = this.form.get(key);
            console.log(`Campo ${key}:`, {
                valid: control?.valid,
                errors: control?.errors,
                value: control?.value
            });
        });
        alert('Por favor complete todos los campos requeridos');
    }
    
    console.groupEnd();
}

  private dataURItoBlob(dataURI: string): Blob {
    console.log('dataURItoBlob - Convirtiendo URI a Blob');
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    console.log('dataURItoBlob - Blob creado con tipo:', mimeString);
    return new Blob([ab], { type: mimeString });
  }

  eliminarFoto(): void {
    console.log('eliminarFoto - Eliminando foto actual');
    this.consentimientoBase64 = null;
    this.donadoraConsentimientoUrl = null;
    this.mostrarImagen = false;
    this.form.get('consentimientoDonadora')?.setValue(null);
    console.log('eliminarFoto - Foto eliminada, estado actual:', this.consentimientoBase64);
  }
  disableTextInputs(): void {
    Object.keys(this.form.controls).forEach(controlName => {
      if (controlName !== 'consentimientoDonadora') {
        this.form.get(controlName)?.disable();
      }
    });
  }
  
}