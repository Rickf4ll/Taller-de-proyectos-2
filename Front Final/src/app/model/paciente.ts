export interface pacientes {
  idPaciente: string;
  nombrePaciente: string;
  apellidoPaternoPaciente: string 
  apellidoMaternoPaciente: string 
  cuna?: { // Relación con Cuna
    idCuna: number;
  }
  estado: string;
  area: string;
  
}
