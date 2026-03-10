// ========================================
// MODELO: GRADO
// Representa los grados escolares (1ro, 2do, etc.)
// ========================================

const mongoose = require('mongoose');

const esquemaGrado = new mongoose.Schema({
    // Nombre del grado (ejemplo: "Primero", "Segundo")
    nombre: {
        type: String,
        required: [true, 'El nombre del grado es obligatorio'],
        trim: true
    },
    
    // Sección (ejemplo: "A", "B", "C")
    seccion: {
        type: String,
        required: [true, 'La sección es obligatoria'],
        trim: true,
        uppercase: true
    },
    
    // Nivel educativo: primaria o secundaria
    nivel: {
        type: String,
        enum: ['primaria', 'secundaria'],
        required: [true, 'El nivel es obligatorio']
    },
    
    // Año escolar (ejemplo: "2024")
    anioEscolar: {
        type: String,
        required: true
    },
    
    // Capacidad máxima de alumnos
    capacidad: {
        type: Number,
        default: 30
    },
    
    // Estado del grado
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
const Grado = mongoose.model('Grado', esquemaGrado);

module.exports = Grado;
