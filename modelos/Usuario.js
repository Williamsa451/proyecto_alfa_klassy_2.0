// ========================================
// MODELO: USUARIO
// Almacena administradores, docentes y alumnos
// ========================================

const mongoose = require('mongoose');

const esquemaUsuario = new mongoose.Schema({
    // Nombre completo del usuario
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    
    // Correo electrónico (único para cada usuario)
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true
    },
    
    // Contraseña (se guardará encriptada)
    contrasena: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    
    // Rol del usuario: admin, docente o alumno
    rol: {
        type: String,
        enum: ['admin', 'director', 'docente', 'alumno'],
        required: [true, 'El rol es obligatorio'],
        default: 'alumno'
    },
    
    // Documento de identidad
    documento: {
        type: String,
        required: true,
        unique: true
    },
    
    // Teléfono de contacto
    telefono: {
        type: String,
        default: ''
    },
    
    // Dirección
    direccion: {
        type: String,
        default: ''
    },
    
    // Estado del usuario (activo o inactivo)
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
const Usuario = mongoose.model('Usuario', esquemaUsuario);

module.exports = Usuario;
