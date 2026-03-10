// ========================================
// MODELO: DETALLE BOLETIN
// Detalles de cada materia en el boletín
// ========================================

const mongoose = require('mongoose');

const esquemaDetalleBoletin = new mongoose.Schema({
    // Referencia al boletín
    boletin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Boletin',
        required: true
    },
    
    // Materia
    materia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Materia',
        required: true
    },
    
    // Nota de la materia
    nota: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    
    // Indicador de logro
    indicadorLogro: {
        type: String,
        enum: ['superior', 'alto', 'basico', 'bajo'],
        default: 'basico'
    },
    
    // Observaciones específicas de la materia
    observaciones: {
        type: String,
        default: ''
    },
    
    // Docente de la materia
    docente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    
    // Fecha de creación
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

// Crear y exportar el modelo
const DetalleBoletin = mongoose.model('DetalleBoletin', esquemaDetalleBoletin);

module.exports = DetalleBoletin;
