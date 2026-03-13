// ========================================
// MIDDLEWARE DE AUTENTICACIÓN
// Protege las rutas según el rol del usuario
// y verifica matrículas/asignaciones activas
// ========================================

const Matricula = require('../modelos/Matricula');
const AsignacionDocente = require('../modelos/AsignacionDocente');

// Obtener el año escolar actual
function obtenerAnioEscolarActual() {
    const fecha = new Date();
    return fecha.getFullYear().toString();
}

// Verificar si el usuario inició sesión
function verificarSesion(req, res, next) {
    if (req.session.usuario) {
        // El usuario tiene sesión activa, continuar
        next();
    } else {
        // No hay sesión, redirigir al login
        res.redirect('/login');
    }
}

// Verificar si el usuario es administrador
function soloAdmin(req, res, next) {
    if (req.session.usuario && req.session.usuario.rol === 'admin') {
        next();
    } else {
        res.redirect('/login');
    }
}

// Verificar si el usuario es director docente
function soloDirector(req, res, next) {
    if (req.session.usuario && req.session.usuario.rol === 'director') {
        next();
    } else {
        res.redirect('/login');
    }
}

// Verificar si el usuario es docente CON asignación activa
async function soloDocente(req, res, next) {
    try {
        // Verificar que hay sesión y es docente
        if (!req.session.usuario || req.session.usuario.rol !== 'docente') {
            return res.redirect('/login');
        }
        
        const docenteId = req.session.usuario.id;
        const anioActual = obtenerAnioEscolarActual();
        
        // Buscar si tiene asignaciones activas en el año actual
        const asignacionActiva = await AsignacionDocente.findOne({
            docente: docenteId,
            anioEscolar: anioActual,
            activo: true
        });
        
        if (!asignacionActiva) {
            // No tiene asignación activa, mostrar mensaje de acceso denegado
            return res.render('error', {
                mensaje: 'No tienes asignaciones activas para este año escolar',
                codigo: 403,
                detalle: 'Contacta al administrador para que te asigne grados y materias.'
            });
        }
        
        // Tiene asignación activa, puede continuar
        next();
        
    } catch (error) {
        console.error('Error al verificar asignación de docente:', error);
        res.redirect('/login');
    }
}

// Verificar si el usuario es alumno CON matrícula activa
async function soloAlumno(req, res, next) {
    try {
        // Verificar que hay sesión y es alumno
        if (!req.session.usuario || req.session.usuario.rol !== 'alumno') {
            return res.redirect('/login');
        }
        
        const alumnoId = req.session.usuario.id;
        const anioActual = obtenerAnioEscolarActual();
        
        // Buscar si tiene matrícula activa en el año actual
        const matriculaActiva = await Matricula.findOne({
            alumno: alumnoId,
            anioEscolar: anioActual,
            estado: 'activa'
        });
        
        if (!matriculaActiva) {
            // No tiene matrícula activa, mostrar mensaje de acceso denegado
            return res.render('error', {
                mensaje: 'No tienes una matrícula activa para este año escolar',
                codigo: 403,
                detalle: 'Contacta al administrador para realizar tu matrícula.'
            });
        }
        
        // Guardar datos de la matrícula en la sesión para uso posterior
        req.session.matricula = {
            id: matriculaActiva._id,
            grado: matriculaActiva.grado,
            anioEscolar: matriculaActiva.anioEscolar
        };
        
        // Tiene matrícula activa, puede continuar
        next();
        
    } catch (error) {
        console.error('Error al verificar matrícula del alumno:', error);
        res.redirect('/login');
    }
}

// Exportar todas las funciones
module.exports = {
    verificarSesion,
    soloAdmin,
    soloDirector,
    soloDocente,
    soloAlumno,
    obtenerAnioEscolarActual
};