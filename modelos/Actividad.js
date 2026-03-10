// ========================================
// MODELO: ACTIVIDAD
// Tareas y actividades creadas por docentes
// ========================================

const mongoose = require('mongoose');

const esquemaActividad = new mongoose.Schema({
    // Título de la actividad
    titulo: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true
    },
    
    // Descripción detallada
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria']
    },
    
    // Docente que creó la actividad
    docente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    
    // Grado al que va dirigida
    grado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grado',
        required: true
    },
    
    // Materia de la actividad
    materia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Materia',
        required: true
    },
    
    // Período académico
    periodo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Periodo',
        required: true
    },
    
    // Tipo de actividad
    tipo: {
        type: String,
        enum: ['tarea', 'examen', 'proyecto', 'exposicion', 'otro'],
        default: 'tarea'
    },
    
    // Puntaje máximo de la actividad
    puntajeMaximo: {
        type: Number,
        required: true,
        default: 100
    },
    
    // Fecha límite de entrega
    fechaLimite: {
        type: Date,
        required: true
    },
    
    // Archivo adjunto (opcional)
    archivoAdjunto: {
        type: String,
        default: ''
    },
    
    // Estado de la actividad
    activo: {
        type: Boolean,
        default: true
    },
    
    // Fecha de creación
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

// Crear y exportar el modelo
const Actividad = mongoose.model('Actividad', esquemaActividad);

module.exports = Actividad;
