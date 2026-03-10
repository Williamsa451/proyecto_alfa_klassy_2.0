// ========================================
// MODELO: NOTICIA
// Noticias del dashboard
// ========================================

const mongoose = require('mongoose');

const esquemaNoticia = new mongoose.Schema({
    // Título de la noticia
    titulo: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true
    },
    
    // Contenido de la noticia
    contenido: {
        type: String,
        required: [true, 'El contenido es obligatorio']
    },
    
    // Autor (docente o admin)
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    
    // Categoría
    categoria: {
        type: String,
        enum: ['general', 'academica', 'evento', 'urgente'],
        default: 'general'
    },
    
    // Imagen de la noticia (opcional)
    imagen: {
        type: String,
        default: ''
    },
    
    // Estado de la noticia
    activo: {
        type: Boolean,
        default: true
    },
    
    // Fecha de publicación
    fechaPublicacion: {
        type: Date,
        default: Date.now
    }
});

// Crear y exportar el modelo
const Noticia = mongoose.model('Noticia', esquemaNoticia);

module.exports = Noticia;
