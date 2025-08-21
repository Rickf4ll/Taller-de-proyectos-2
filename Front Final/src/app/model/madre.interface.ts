export interface Madre
 {
    idMadre:                       string;
    nombreMadre:                   string;
    apellidoPaternoMadre:          string;
    apellidoMaternoMadre:          string;
    fechaNacimientoMadre:          Date;
    telefonoMadre:                 string;
    tallaMadre:                    number;
    departamento:                  string;
    provincia:                     string;
    distrito:                      string;
    direccionActualMadre:          string;
    centroSaludControlProcedencia: string;
    numeroControles:               number;
    ocupacion:                     string;
    pesoInicialMadreGestante:      number;
    pesoFinalMadreGestante:        number;
    transfusionSangreMadre:        string;
    consumoCigarros:               string;
    consumoDrogas:                 string;
    consumoMedicamentos:           string;
    enfermedades:                  string;
    pruebaSerologicos:             string;
    pruebaSifilis:                 string;
    pruebaHepatitis:               string;
    pruebaVIH:                     string;
    examenHemoglobina:             string;
    enfermedadActual:              string;
    donarLeche:                    string;
    aptaParaDonar:                 string;
    menorDeEdad:                   string;
    consentimientoMadre:           null;
    paciente:                      Paciente;
}

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
    detalleEdadGestacionalPaciente: string;
    area:                           string;
    estado:                         string;
    diagnosticoPaciente:            DiagnosticoPaciente;
}

export interface DiagnosticoPaciente {
    idDiagnosticoPaciente: string;
    observacionEnfermedad: string;
}
