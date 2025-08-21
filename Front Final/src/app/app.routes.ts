import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard'; 
import DispensacionComponent from './dispensacion/dispensacion.component';

export const routes: Routes = [
   {
      path: '',
      redirectTo: 'menu-areas',
      pathMatch: 'full'
    },
    {
      path: 'login',
      loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
    },
    {
      path: 'menu-areas',
      loadComponent: () => import('./menu-areas/menu-areas.component').then(m => m.MenuAreasComponent),
        canActivate: [AuthGuard]
    },
    ///////////////////////////////////////
    {
      path: 'menu-historia',
      loadComponent: () => import('./menu-historia/menu-historia.component').then(m => m.MenuHistoriaComponent),
      canActivate: [AuthGuard]
    },
    
    {
      path: 'menu-almacen',
      loadComponent: () => import('./menu-almacen/menu-almacen.component').then(m => m.MenuAlmacenComponent),
      canActivate: [AuthGuard]
    },
    {
      path: 'reportes',
      loadComponent: () => import('./reportes/reportes.component').then(m => m.ReportesComponent),
      canActivate: [AuthGuard]
    },

    //////////////////////////////////
    {
      path: 'leches-disponibles',
      loadComponent: () => import('./leches-disponibles/leches-disponibles.component').then(m => m.LechesDisponiblesComponent) 
    },
    {
      path: 'registro-autologa',
      loadComponent: () => import('./registro-autologa/registro-autologa.component').then(m => m.RegistroAutologaComponent)
    },
    {
      path: 'registro-pasteurizado',
      loadComponent: () => import('./registro-pasteurizado/registro-pasteurizado.component').then(m => m.RegistroPasteurizadoComponent) 
    },
  
    {
      path: 'registro-madre/:idPaciente', 
      loadComponent: () => import('./registro-madre/registro-madre.component')
    },
     
    {
      path: 'crear-historia-clinica', 
      loadComponent: () => import('./crear-historia-clinica/crear-historia-clinica.component')
    },
    {
      path: 'buscar-historia-clinica',
      loadComponent: () => import('./buscar-historia-clinica/buscar-historia-clinica.component')
    },
    {
      path: 'actualizar-historia-clinica/:idPaciente',
      loadComponent: () => import('./actualizar-historia-clinica/actualizar-historia-clinica.component')
    },
    {
      path: 'enfermedades-paciente/:idDiagnosticoPaciente',
      loadComponent: () => import('./enfermedades-paciente/enfermedades-paciente.component')
    },
    {
      path: 'apoderado/:idMadre',
      loadComponent: () => import('./apoderado/apoderado.component')
    },
    {
      path: 'ver-historia-clinica/:idPaciente',
      loadComponent: () => import('./ver-historia-clinica/ver-historia-clinica.component')  
    },

    {
      path: 'crear-usuario',
      loadComponent: () => import('./crear-usuario/crear-usuario.component').then(m => m.CrearUsuarioComponent)
          
    },
    {
      path: 'administrar-usuarios',
      loadComponent: () => import('./administrar-usuarios/administrar-usuarios.component').then(m => m.AdministrarUsuariosComponent),
      canActivate: [AuthGuard]
    },
    { 
      path: 'reportes',
      loadComponent: () => import('./reportes/reportes.component').then(m => m.ReportesComponent)
    },
    {
      path: 'reporte-por-paciente/:idD',
      loadComponent: () => import('./reporte-por-paciente/reporte-por-paciente.component').then(m => m.ReportePorPacienteComponent)
    },

    {path: 'pacientes', 
      loadComponent: () => import('./pacientes/pacientes.component') ,canActivate: [AuthGuard] }, // <-- Primero
   { path: 'donantes', loadComponent: () => import('./donantes/donantes.component'),canActivate: [AuthGuard] },
   { path: 'registro-donante', loadComponent: () => import('./registro-donante/registro-donante.component') },
   { path: 'registro-procura', loadComponent: () => import('./registrar-procura/registrar-procura.component') },
   { path: 'registro-procura/:id', loadComponent: () => import('./registrar-procura/registrar-procura.component') },
   { path: 'registro-leche-donadora', loadComponent: () => import('./registro-leche-donadora/registro-leche-donadora.component') },
   { path: 'registro-leche-donadora/:id', loadComponent: () => import('./registro-leche-donadora/registro-leche-donadora.component') },   
   { path: 'dispensacion', loadComponent: () => import('./dispensacion/dispensacion.component')},
   { path: 'pase-de-visita/:id/:idcuna', loadComponent: () => import('./pase-de-visita/pase-de-visita.component')},
   { 
    path: 'dispensacion/:idPaciente/:idCuna', // <-- Parámetros definidos en la ruta
    component: DispensacionComponent 
  },
  {
    path: 'ver-pase-de-visita',
    loadComponent: () => import('./ver-pase-de-visita/ver-pase-de-visita.component')
  },
  { path: 'ver-pase-de-visita/:id/:idcuna', loadComponent: () => import('./ver-pase-de-visita/ver-pase-de-visita.component')},

  {
    path: 'registro-formula',loadComponent: () => import('./registro-formula/registro-formula.component')
  }
 ];
  