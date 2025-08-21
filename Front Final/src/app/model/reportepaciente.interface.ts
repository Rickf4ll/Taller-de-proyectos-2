export interface ReportePaciente {
    idReportePaciente: string;
    lecheAutologa:     number;
    ldm:               number;
    lechePasteurizada: number;
    lecheFormula:      number;
    paciente:          Paciente;
}

export interface Paciente {
    idPaciente:                     string;
    nombrePaciente:                 string;
    apellidoPaternoPaciente:        string;
    apellidoMaternoPaciente:        string;
    fechaNacimientoPaciente:        Date | null;
    generoPaciente:                 string;
    pesoNacimientoPaciente:         number;
    detallePesoNacimientoPaciente:  string;
    edadGestacionalPaciente:        number;
    detalleEdadGestacionalPaciente: string;
    area:                           string;
    estado:                         string;
    fechaIngreso:                   Date;
    cuna:                           Cuna;
    diagnosticoPaciente:            DiagnosticoPaciente;
}

export interface Cuna {
    idCuna:     string;
    estadoCuna: string;
}

export interface DiagnosticoPaciente {
    idDiagnosticoPaciente:    string;
    observacionEnfermedad:    string;
    hibernateLazyInitializer: HibernateLazyInitializer;
}

export interface HibernateLazyInitializer {
}
