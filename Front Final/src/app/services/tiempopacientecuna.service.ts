import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { TiempoPacienteCuna } from '../model/tiempopacientecuna.interface';
import { API_URL } from '../conexion';

@Injectable({
  providedIn: 'root'
})
export class TiempoPacienteCunaService {
  private apiUrl = `${API_URL}/tiempoPacienteCunas`; // Reemplaza con tu URL real

  constructor(private http: HttpClient) {}

  guardar(tiempo: TiempoPacienteCuna): Observable<TiempoPacienteCuna> {
    return this.http.post<TiempoPacienteCuna>(this.apiUrl, tiempo);
  }

  listar(): Observable<TiempoPacienteCuna[]> {
    return this.http.get<TiempoPacienteCuna[]>(this.apiUrl);
  }

  actualizar(id: String, relacion: TiempoPacienteCuna): Observable<TiempoPacienteCuna> {
    return this.http.put<TiempoPacienteCuna>(`${this.apiUrl}/${id}`, relacion);
  }

  obtenerRelacionPorPaciente(idPaciente: string): Observable<TiempoPacienteCuna | null> {
    return this.listar().pipe(
      // Filtramos por paciente
      map((relaciones: TiempoPacienteCuna[]) => {
        const coincidencias = relaciones
          .filter(rel => rel.paciente?.idPaciente === idPaciente)
          .sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());
  
        return coincidencias[0] || null; // devolvemos la más reciente o null
      }),
      catchError(err => {
        console.warn(`Error al buscar relación por paciente ${idPaciente}`, err);
        return of(null);
      })
    );
  }
  actualizarRelacion(tiempoPacienteCuna: TiempoPacienteCuna): Observable<any> {
    return this.http.put(`${this.apiUrl}/${tiempoPacienteCuna.idTiempoPacienteCuna}`, tiempoPacienteCuna);
  }
  
  
  
  

  obtenerPorId(idRelacion: string): Observable<TiempoPacienteCuna | null> {
    return this.http.get<TiempoPacienteCuna>(`${this.apiUrl}/${idRelacion}`).pipe(
      catchError(err => {
        console.warn(`Error al obtener relación por ID ${idRelacion}`, err);
        return of(null); // Retorna null si hay error
      })
    );
  }
  
  
}
