// ========================================
// MODELO: MATRICULA
// Vincula un alumno con un grado
// ========================================

const mongoose = require('mongoose');

const esquemaMatricula = new mongoose.Schema({
    // Referencia al alumno (Usuario con rol 'alumno')
    alumno: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El alumno es obligatorio']
    },
    
    // Referencia al grado
    grado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grado',
        required: [true, 'El grado es obligatorio']
    },
    
    // Año escolar de la matrícula
    anioEscolar: {
        type: String,
        required: true
    },
    
    // Fecha de matrícula
    fechaMatricula: {
        type: Date,
        default: Date.now
    },
    
    // Estado de la matrícula
    estado: {
        type: String,
        enum: ['activa', 'retirada', 'graduada', 'pendiente'],
        default: 'activa'
    },
    
    // Observaciones
    observaciones: {
        type: String,
        default: ''
    },
    
    // Fecha de creación
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

// Crear y exportar el modelo
const Matricula = mongoose.model('Matricula', esquemaMatricula);

module.exports = Matricula;
