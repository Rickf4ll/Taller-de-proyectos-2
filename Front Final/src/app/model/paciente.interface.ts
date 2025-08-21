export interface Paciente {
    idPaciente:                     string;
    nombrePaciente:                 string;
    apellidoPaternoPaciente:        string;
    apellidoMaternoPaciente:        string;
    fechaNacimientoPaciente:        Date;
    generoPaciente:                 string;
    pesoNacimientoPaciente:         number;
    detallePesoNacimientoPaciente:  string;
    edadGestacionalPaciente:        number;
    dniMadre:                       string
    detalleEdadGestacionalPaciente: string;
    fechaIngreso: string;
    fechaFinal: string;
    area:                           string;
    estado:                         string;
    cuna: Cuna;
    diagnosticoPaciente:            DiagnosticoPaciente;
}

export interface DiagnosticoPaciente {
    idDiagnosticoPaciente: string;
    observacionEnfermedad: string;
}

export interface Cuna {
    idCuna: string;
    estadoCuna: string;
}
