import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import cors from 'cors';
import { Donadora } from '../model/donadora';
import { API_URL } from '../conexion';
@Injectable({
    providedIn: 'root'
  })
  export class DonadoraService {
    private http= inject(HttpClient);
    private cache = new Map<string, Donadora>(); // Simple caché

    create(donadora: any)
    {
      return this.http.post(`${API_URL}/donadoras`,donadora);
    }
    listar(): Observable<Donadora[]> {
      return this.http.get<Donadora[]>(`${API_URL}/donadoras`);
    }
    getDonadoraById(id: string): Observable<Donadora> {
      if (this.cache.has(id)) {
        return of(this.cache.get(id)!);
      }
      return this.http.get<Donadora>(`${API_URL}/donadoras/${id}`).pipe(
        tap(data => this.cache.set(id, data))
      );
    }
    updateDonadora(id: string, formData: FormData): Observable<Donadora> {
      return this.http.put<Donadora>(
        `${API_URL}/donadoras/${id}`, 
        formData,
        {
          headers: { 
          }
        }
      );
    }

    subirConsentimiento(idDonadora: string, file: File) {
      const formData = new FormData();
      formData.append('file', file);
      return this.http.post(`${API_URL}/donadoras/${idDonadora}/subir-consentimiento`, formData);
    }
  } 