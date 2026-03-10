// ========================================
// MODELO: MATERIA
// Representa las materias del colegio
// ========================================

const mongoose = require('mongoose');

const esquemaMateria = new mongoose.Schema({
    // Nombre de la materia
    nombre: {
        type: String,
        required: [true, 'El nombre de la materia es obligatorio'],
        trim: true
    },
    
    // Código único de la materia
    codigo: {
        type: String,
        required: [true, 'El código es obligatorio'],
        unique: true,
        uppercase: true
    },
    
    // Descripción de la materia
    descripcion: {
        type: String,
        default: ''
    },
    
    // Nivel educativo donde se imparte
    nivel: {
        type: String,
        enum: ['primaria', 'secundaria', 'ambos'],
        default: 'ambos'
    },
    
    // Estado de la materia
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
const Materia = mongoose.model('Materia', esquemaMateria);

module.exports = Materia;
