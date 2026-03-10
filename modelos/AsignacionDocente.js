// ========================================
// MODELO: ASIGNACION DOCENTE
// Vincula un docente con un grado y una materia
// ========================================

const mongoose = require('mongoose');

const esquemaAsignacionDocente = new mongoose.Schema({
    // Referencia al docente (Usuario con rol 'docente')
    docente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El docente es obligatorio']
    },
    
    // Referencia al grado
    grado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grado',
        required: [true, 'El grado es obligatorio']
    },
    
    // Referencia a la materia
    materia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Materia',
        required: [true, 'La materia es obligatoria']
    },
    
    // Año escolar
    anioEscolar: {
        type: String,
        required: true
    },
    
    // Estado de la asignación
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
const AsignacionDocente = mongoose.model('AsignacionDocente', esquemaAsignacionDocente);

module.exports = AsignacionDocente;
