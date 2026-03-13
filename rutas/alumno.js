// ========================================
// RUTAS DEL ALUMNO
// Ver actividades, subir entregas, ver notas y noticias
// ========================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { soloAlumno } = require('../middleware/autenticacion');

// Importar modelos
const { 
    Actividad,
    EntregaActividad,
    Nota,
    Matricula,
    Noticia,
    Grado,
    Materia,
    Periodo
} = require('../modelos');

// Configurar multer para subir archivos
const almacenamiento = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'publico/archivos/entregas');
    },
    filename: (req, file, cb) => {
        const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, nombreUnico + path.extname(file.originalname));
    }
});

const subidaArchivo = multer({ 
    storage: almacenamiento,
    limits: { fileSize: 10 * 1024 * 1024 }, // Máximo 10MB
    fileFilter: (req, file, cb) => {
        const tiposPermitidos = /pdf|doc|docx|jpg|jpeg|png|txt|zip/;
        const extension = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
        if (extension) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'));
        }
    }
});

// Aplicar middleware de autenticación (verifica matrícula activa)
router.use(soloAlumno);

// ========================================
// DASHBOARD DEL ALUMNO
// ========================================
router.get('/dashboard', async (req, res) => {
    try {
        const alumnoId = req.session.usuario.id;
        const gradoId = req.session.matricula.grado;
        
        // Obtener datos del grado
        const grado = await Grado.findById(gradoId);
        
        // Contar actividades pendientes
        const actividadesActivas = await Actividad.find({
            grado: gradoId,
            activo: true,
            fechaLimite: { $gte: new Date() }
        });
        
        const idsActividades = actividadesActivas.map(a => a._id);
        
        // Contar entregas realizadas
        const entregasRealizadas = await EntregaActividad.countDocuments({
            alumno: alumnoId,
            actividad: { $in: idsActividades }
        });
        
        const actividadesPendientes = actividadesActivas.length - entregasRealizadas;
        
        // Obtener últimas notas
        const notas = await Nota.find({ alumno: alumnoId })
            .populate('materia', 'nombre')
            .sort({ fechaActualizacion: -1 })
            .limit(5);
        
        // Obtener noticias recientes
        const noticias = await Noticia.find({ activo: true })
            .populate('autor', 'nombre')
            .sort({ fechaPublicacion: -1 })
            .limit(5);
        
        res.render('alumno/dashboard', {
            titulo: 'Mi Dashboard',
            pagina: 'dashboard',
            grado,
            estadisticas: {
                actividadesPendientes,
                entregasRealizadas,
                totalActividades: actividadesActivas.length
            },
            notas,
            noticias
        });
    } catch (error) {
        console.error('Error en dashboard alumno:', error);
        res.render('error', { mensaje: 'Error al cargar el dashboard', codigo: 500 });
    }
});

// ========================================
// VER ACTIVIDADES
// ========================================
router.get('/actividades', async (req, res) => {
    try {
        const alumnoId = req.session.usuario.id;
        const gradoId = req.session.matricula.grado;
        
        // Obtener todas las actividades del grado
        const actividades = await Actividad.find({ 
            grado: gradoId,
            activo: true 
        })
        .populate('materia', 'nombre codigo')
        .populate('docente', 'nombre')
        .sort({ fechaLimite: 1 });
        
        // Obtener entregas del alumno
        const entregas = await EntregaActividad.find({ alumno: alumnoId });
        
        // Crear mapa de entregas
        const entregasPorActividad = {};
        entregas.forEach(e => {
            entregasPorActividad[e.actividad.toString()] = e;
        });
        
        // Combinar actividades con estado de entrega
        const actividadesConEstado = actividades.map(act => {
            const entrega = entregasPorActividad[act._id.toString()];
            return {
                actividad: act,
                entrega: entrega || null,
                vencida: new Date() > new Date(act.fechaLimite)
            };
        });
        
        res.render('alumno/actividades', {
            titulo: 'Mis Actividades',
            pagina: 'actividades',
            actividades: actividadesConEstado,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error al cargar actividades:', error);
        res.render('error', { mensaje: 'Error al cargar actividades', codigo: 500 });
    }
});

// Ver detalle de una actividad
router.get('/actividades/:id', async (req, res) => {
    try {
        const alumnoId = req.session.usuario.id;
        
        const actividad = await Actividad.findById(req.params.id)
            .populate('materia', 'nombre')
            .populate('docente', 'nombre')
            .populate('grado', 'nombre seccion');
        
        if (!actividad) {
            return res.redirect('/alumno/actividades?error=Actividad no encontrada');
        }
        
        // Buscar si ya entregó
        const entrega = await EntregaActividad.findOne({
            actividad: req.params.id,
            alumno: alumnoId
        });
        
        res.render('alumno/actividad-detalle', {
            titulo: actividad.titulo,
            pagina: 'actividades',
            actividad,
            entrega,
            vencida: new Date() > new Date(actividad.fechaLimite),
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error al ver actividad:', error);
        res.redirect('/alumno/actividades?error=Error al cargar la actividad');
    }
});

// Entregar actividad
router.post('/actividades/:id/entregar', subidaArchivo.single('archivo'), async (req, res) => {
    try {
        const alumnoId = req.session.usuario.id;
        const actividadId = req.params.id;
        const { contenido } = req.body;
        
        // Verificar que la actividad existe
        const actividad = await Actividad.findById(actividadId);
        if (!actividad) {
            return res.redirect('/alumno/actividades?error=Actividad no encontrada');
        }
        
        // Verificar si ya entregó
        const entregaExistente = await EntregaActividad.findOne({
            actividad: actividadId,
            alumno: alumnoId
        });
        
        if (entregaExistente) {
            return res.redirect('/alumno/actividades/' + actividadId + '?error=Ya entregaste esta actividad');
        }
        
        // Crear la entrega
        const nuevaEntrega = new EntregaActividad({
            actividad: actividadId,
            alumno: alumnoId,
            contenido: contenido || '',
            archivoAdjunto: req.file ? '/archivos/entregas/' + req.file.filename : '',
            entregaTardia: new Date() > new Date(actividad.fechaLimite),
            estado: 'entregada'
        });
        
        await nuevaEntrega.save();
        
        res.redirect('/alumno/actividades/' + actividadId + '?mensaje=Actividad entregada correctamente');
    } catch (error) {
        console.error('Error al entregar actividad:', error);
        res.redirect('/alumno/actividades?error=Error al entregar la actividad');
    }
});

// ========================================
// VER NOTAS
// ========================================
router.get('/notas', async (req, res) => {
    try {
        const alumnoId = req.session.usuario.id;
        const gradoId = req.session.matricula.grado;
        
        // Obtener todas las notas del alumno
        const notas = await Nota.find({ 
            alumno: alumnoId,
            grado: gradoId
        })
        .populate('materia', 'nombre codigo')
        .populate('periodo', 'nombre numero')
        .sort({ 'materia.nombre': 1 });
        
        // Agrupar notas por materia
        const notasPorMateria = {};
        notas.forEach(nota => {
            const materiaId = nota.materia._id.toString();
            if (!notasPorMateria[materiaId]) {
                notasPorMateria[materiaId] = {
                    materia: nota.materia,
                    notas: []
                };
            }
            notasPorMateria[materiaId].notas.push(nota);
        });
        
        // Calcular promedio general
        let sumaNotas = 0;
        let cantidadNotas = 0;
        notas.forEach(n => {
            if (n.nota > 0) {
                sumaNotas += n.nota;
                cantidadNotas++;
            }
        });
        const promedioGeneral = cantidadNotas > 0 ? (sumaNotas / cantidadNotas).toFixed(1) : 0;
        
        res.render('alumno/notas', {
            titulo: 'Mis Notas',
            pagina: 'notas',
            notasPorMateria: Object.values(notasPorMateria),
            promedioGeneral,
            mensaje: req.query.mensaje || null
        });
    } catch (error) {
        console.error('Error al cargar notas:', error);
        res.render('error', { mensaje: 'Error al cargar notas', codigo: 500 });
    }
});

// ========================================
// VER NOTICIAS
// ========================================
router.get('/noticias', async (req, res) => {
    try {
        const noticias = await Noticia.find({ activo: true })
            .populate('autor', 'nombre')
            .sort({ fechaPublicacion: -1 });
        
        res.render('alumno/noticias', {
            titulo: 'Noticias',
            pagina: 'noticias',
            noticias
        });
    } catch (error) {
        console.error('Error al cargar noticias:', error);
        res.render('error', { mensaje: 'Error al cargar noticias', codigo: 500 });
    }
});

module.exports = router;
