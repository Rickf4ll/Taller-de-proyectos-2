import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const permisos = JSON.parse(localStorage.getItem('permisos') || '[]') as string[];
    const ruta = state.url.replace('/', '');
  
    const expiracion = localStorage.getItem('expiracion');
    const ahora = new Date().getTime();
  
    if (!expiracion || ahora > Number(expiracion)) {
      //alert('Sesión expirada. Inicia sesión nuevamente.');
      localStorage.clear(); // opcional: limpiar todo
      this.router.navigate(['/login']);
      return false;
    }
  
    if (permisos.includes(ruta)) {
      return true;
    } else {
      alert('No tienes permiso para acceder a esta sección.');
      this.router.navigate(['/menu-areas']);
      return false;
    }
  }
}
