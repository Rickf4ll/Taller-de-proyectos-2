import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../conexion';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LecheFormulaService {
    private apiUrl = `${API_URL}`;
  
  private formula = `${this.apiUrl}/registrosFormula`;

  constructor(private http: HttpClient) { }

  crearRegistro(registro: any) {
    return this.http.post(this.formula, registro);
  }
  
  findAll() {
    return this.http.get<any[]>(this.formula).pipe(
      tap(data => console.log('Datos de fórmula recibidos:', data)),
      catchError(error => {
        console.error('Error en findAll:', error);
        return of([]); // Devuelve array vacío para no romper el flujo
      })
    );
  }
  getTotalFormula(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total`);
  }
  
  eliminarLoteFormula(codigo: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/registrosFormula/${codigo}`);
}

}