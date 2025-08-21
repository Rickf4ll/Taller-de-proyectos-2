import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../conexion';

@Injectable({
  providedIn: 'root'
})
export class MadreService {

  private http = inject(HttpClient);

  // Método para crear una nueva madre
  create(madre: any) {
    return this.http.post(`${API_URL}/madres`, madre);
  }

  // Otros métodos como listar o obtener detalles de madres
  list() {
    return this.http.get(`${API_URL}/madres`);
  }
  getById(idMadre: string) {
    return this.http.get(`${API_URL}/${idMadre}`);
  }

  subirConsentimiento(idMadre: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${API_URL}/madres/${idMadre}/subir-consentimiento`, formData);
  }
}
