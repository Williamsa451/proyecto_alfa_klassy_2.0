// ========================================
// EXPORTACIÓN DE TODOS LOS MODELOS
// ========================================

const Usuario = require('./Usuario');
const Grado = require('./Grado');
const Materia = require('./Materia');
const Periodo = require('./Periodo');
const Matricula = require('./Matricula');
const AsignacionDocente = require('./AsignacionDocente');
const Actividad = require('./Actividad');
const EntregaActividad = require('./EntregaActividad');
const Nota = require('./Nota');
const Boletin = require('./Boletin');
const DetalleBoletin = require('./DetalleBoletin');
const Noticia = require('./Noticia');

module.exports = {
    Usuario,
    Grado,
    Materia,
    Periodo,
    Matricula,
    AsignacionDocente,
    Actividad,
    EntregaActividad,
    Nota,
    Boletin,
    DetalleBoletin,
    Noticia
};
