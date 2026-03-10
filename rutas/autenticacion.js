// ========================================
// RUTAS DE AUTENTICACIÓN
// Login, logout y registro
// ========================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Usuario = require('../modelos/Usuario');

// ========================================
// MOSTRAR PÁGINA DE LOGIN
// ========================================
router.get('/login', (req, res) => {
    // si ya inicia sesion lo redirecciona
    if (req.session.usuario) {
        const rol = req.session.usuario.rol;
        if (rol === 'admin') return res.redirect('/admin/dashboard');
        if (rol === 'docente') return res.redirect('/docente/dashboard');
        if (rol === 'alumno') return res.redirect('/alumno/dashboard');
        if (rol === 'director') return res.redirect('/director/dashboard');
    }
    
    res.render('login', { 
        error: null,
        titulo: 'Iniciar Sesión'
    });
});

// ========================================
// PROCESAR LOGIN
// ========================================
router.post('/login', async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        
        // Buscar usuario por correo
        const usuario = await Usuario.findOne({ correo: correo.toLowerCase() });
        
        // Verificar si existe el usuario
        if (!usuario) {
            return res.render('login', {
                error: 'Correo o contraseña incorrectos',
                titulo: 'Iniciar Sesión'
            });
        }
        
        // Verificar si el usuario está activo
        if (!usuario.activo) {
            return res.render('login', {
                error: 'Tu cuenta está desactivada. Contacta al administrador.',
                titulo: 'Iniciar Sesión'
            });
        }
        
        // Verificar la contraseña
        const contrasenaCorrecta = await bcrypt.compare(contrasena, usuario.contrasena);
        
        if (!contrasenaCorrecta) {
            return res.render('login', {
                error: 'Correo o contraseña incorrectos',
                titulo: 'Iniciar Sesión'
            });
        }
        
        // Crear la sesión del usuario
        req.session.usuario = {
            id: usuario._id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol,
            documento: usuario.documento
        };
        
        // Redirigir según el rol
        if (usuario.rol === 'admin') {
            res.redirect('/admin/dashboard');
        } else if (usuario.rol === 'docente') {
            res.redirect('/docente/dashboard');
        } else if (usuario.rol === 'alumno') {
            res.redirect('/alumno/dashboard');
        } else if (usuario.rol === 'director') {
            res.redirect('/director/dashboard');
        }
        
    } catch (error) {
        console.error('Error en login:', error);
        res.render('login', {
            error: 'Ocurrió un error. Intenta de nuevo.',
            titulo: 'Iniciar Sesión'
        });
    }
});

// ========================================
// CERRAR SESIÓN
// ========================================
router.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Error al cerrar sesión:', error);
        }
        res.redirect('/login');
    });
});

module.exports = router;
