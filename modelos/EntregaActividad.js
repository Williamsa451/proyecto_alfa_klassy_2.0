// ========================================
// MODELO: ENTREGA ACTIVIDAD
// Entregas de actividades por parte de alumnos
// ========================================

const mongoose = require('mongoose');

const esquemaEntregaActividad = new mongoose.Schema({
    // Actividad que se entrega
    actividad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Actividad',
        required: true
    },
    
    // Alumno que entrega
    alumno: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    
    // Comentario del alumno
    comentario: {
        type: String,
        default: ''
    },
    
    // Archivo de entrega
    archivoEntrega: {
        type: String,
        default: ''
    },
    
    // Fecha de entrega
    fechaEntrega: {
        type: Date,
        default: Date.now
    },
    
    // Calificación obtenida
    calificacion: {
        type: Number,
        default: null
    },
    
    // Retroalimentación del docente
    retroalimentacion: {
        type: String,
        default: ''
    },
    
    // Estado de la entrega
    estado: {
        type: String,
        enum: ['pendiente', 'entregada', 'calificada', 'tarde'],
        default: 'entregada'
    },
    
    // Fecha de calificación
    fechaCalificacion: {
        type: Date,
        default: null
    }
});

// Crear y exportar el modelo
const EntregaActividad = mongoose.model('EntregaActividad', esquemaEntregaActividad);

module.exports = EntregaActividad;
