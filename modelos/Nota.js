// ========================================
// MODELO: NOTA
// Notas de los alumnos por materia y período
// ========================================

const mongoose = require('mongoose');

const esquemaNota = new mongoose.Schema({
    // Alumno
    alumno: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    
    // Materia
    materia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Materia',
        required: true
    },
    
    // Grado
    grado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grado',
        required: true
    },
    
    // Período académico
    periodo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Periodo',
        required: true
    },
    
    // Nota del período (0-100 o escala que uses)
    nota: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    
    // Observaciones
    observaciones: {
        type: String,
        default: ''
    },
    
    // Docente que registró la nota
    registradoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    
    // Fecha de registro
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

// Crear y exportar el modelo
const Nota = mongoose.model('Nota', esquemaNota);

module.exports = Nota;
