import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apoderado } from '../model/apoderado.interface';
import { Observable } from 'rxjs';
import { Madre } from '../model/madre.interface';
import { API_URL } from '../conexion';

@Injectable({
  providedIn: 'root'
})
export class ApoderadoService {

  private apiUrl = `http://${API_URL}/apoderados`; // <-- Base URL

  constructor(private http: HttpClient) {}

  getAll(): Observable<Apoderado[]> {
    return this.http.get<Apoderado[]>(this.apiUrl);
  }

  getById(id: string): Observable<Madre> {
    return this.http.get<Madre>(`${this.apiUrl}/${id}`);
  }

  create(apoderado: Apoderado): Observable<Apoderado> {
    return this.http.post<Apoderado>(this.apiUrl, apoderado);
  }

  update(id: string, apoderado: Apoderado): Observable<Apoderado> {
    return this.http.put<Apoderado>(`${this.apiUrl}/${id}`, apoderado);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
