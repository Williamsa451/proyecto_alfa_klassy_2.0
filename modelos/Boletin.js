// ========================================
// MODELO: BOLETIN
// Boletín de calificaciones del alumno
// ========================================

const mongoose = require('mongoose');

const esquemaBoletin = new mongoose.Schema({
    // Alumno
    alumno: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
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
    
    // Año escolar
    anioEscolar: {
        type: String,
        required: true
    },
    
    // Promedio general del período
    promedioGeneral: {
        type: Number,
        default: 0
    },
    
    // Puesto en el grado
    puesto: {
        type: Number,
        default: null
    },
    
    // Observaciones generales
    observaciones: {
        type: String,
        default: ''
    },
    
    // Estado del boletín
    estado: {
        type: String,
        enum: ['borrador', 'publicado', 'entregado'],
        default: 'borrador'
    },
    
    // Fecha de generación
    fechaGeneracion: {
        type: Date,
        default: Date.now
    }
});

// Crear y exportar el modelo
const Boletin = mongoose.model('Boletin', esquemaBoletin);

module.exports = Boletin;
