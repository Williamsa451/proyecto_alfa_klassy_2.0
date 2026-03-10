// ========================================
// MODELO: PERIODO
// Representa los períodos académicos (bimestres, trimestres)
// ========================================

const mongoose = require('mongoose');

const esquemaPeriodo = new mongoose.Schema({
    // Nombre del período (ejemplo: "Primer Bimestre")
    nombre: {
        type: String,
        required: [true, 'El nombre del período es obligatorio'],
        trim: true
    },
    
    // Número del período (1, 2, 3, 4)
    numero: {
        type: Number,
        required: true
    },
    
    // Año escolar
    anioEscolar: {
        type: String,
        required: true
    },
    
    // Fecha de inicio del período
    fechaInicio: {
        type: Date,
        required: true
    },
    
    // Fecha de fin del período
    fechaFin: {
        type: Date,
        required: true
    },
    
    // Estado del período (activo = en curso)
    activo: {
        type: Boolean,
        default: false
    },
    
    // Fecha de creación
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

// Crear y exportar el modelo
const Periodo = mongoose.model('Periodo', esquemaPeriodo);

module.exports = Periodo;
