// ========================================
// RUTAS DEL DOCENTE
// Gestión de actividades, calificaciones y noticias
// ========================================

const express = require('express');
const router = express.Router();
const { soloDocente } = require('../middleware/autenticacion');

// Importar modelos
const { 
    AsignacionDocente,
    Actividad,
    EntregaActividad,
    Nota,
    Matricula,
    Periodo,
    Noticia,
    Grado,
    Materia
} = require('../modelos');

// Aplicar middleware de autenticación
router.use(soloDocente);

// ========================================
// DASHBOARD DEL DOCENTE
// ========================================
router.get('/dashboard', async (req, res) => {
    try {
        const docenteId = req.session.usuario.id;
        
        // Obtener asignaciones del docente
        const asignaciones = await AsignacionDocente.find({ 
            docente: docenteId, 
            activo: true 
        })
        .populate('grado', 'nombre seccion nivel')
        .populate('materia', 'nombre codigo');
        
        // Contar actividades creadas
        const totalActividades = await Actividad.countDocuments({ docente: docenteId });
        
        // Contar entregas pendientes de calificar
        const actividadesDocente = await Actividad.find({ docente: docenteId });
        const idsActividades = actividadesDocente.map(a => a._id);
        const entregasPendientes = await EntregaActividad.countDocuments({
            actividad: { $in: idsActividades },
            estado: 'entregada'
        });
        
        // Obtener noticias recientes
        const noticias = await Noticia.find()
            .populate('autor', 'nombre')
            .sort({ fechaPublicacion: -1 })
            .limit(5);
        
        res.render('docente/dashboard', {
            titulo: 'Dashboard',
            pagina: 'dashboard',
            asignaciones,
            estadisticas: {
                totalAsignaciones: asignaciones.length,
                totalActividades,
                entregasPendientes
            },
            noticias
        });
    } catch (error) {
        console.error('Error en dashboard docente:', error);
        res.render('error', { mensaje: 'Error al cargar el dashboard', codigo: 500 });
    }
});

// ========================================
// GESTIÓN DE ACTIVIDADES
// ========================================

// Listar actividades
router.get('/actividades', async (req, res) => {
    try {
        const docenteId = req.session.usuario.id;
        
        // Obtener actividades del docente
        const actividades = await Actividad.find({ docente: docenteId })
            .populate('grado', 'nombre seccion')
            .populate('materia', 'nombre')
            .populate('periodo', 'nombre')
            .sort({ fechaCreacion: -1 });
        
        // Obtener asignaciones para el formulario
        const asignaciones = await AsignacionDocente.find({ 
            docente: docenteId, 
            activo: true 
        })
        .populate('grado', 'nombre seccion nivel')
        .populate('materia', 'nombre codigo');
        
        // Obtener períodos activos
        const periodos = await Periodo.find({ activo: true });
        
        res.render('docente/actividades', {
            titulo: 'Mis Actividades',
            pagina: 'actividades',
            actividades,
            asignaciones,
            periodos,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error al listar actividades:', error);
        res.render('error', { mensaje: 'Error al cargar actividades', codigo: 500 });
    }
});

// Crear actividad
router.post('/actividades/crear', async (req, res) => {
    try {
        const docenteId = req.session.usuario.id;
        const { titulo, descripcion, grado, materia, periodo, tipo, puntajeMaximo, fechaLimite } = req.body;
        
        const nuevaActividad = new Actividad({
            titulo,
            descripcion,
            docente: docenteId,
            grado,
            materia,
            periodo,
            tipo,
            puntajeMaximo: parseInt(puntajeMaximo) || 100,
            fechaLimite: new Date(fechaLimite)
        });
        
        await nuevaActividad.save();
        res.redirect('/docente/actividades?mensaje=Actividad creada exitosamente');
    } catch (error) {
        console.error('Error al crear actividad:', error);
        res.redirect('/docente/actividades?error=Error al crear actividad');
    }
});

// Ver entregas de una actividad
router.get('/actividades/:id/entregas', async (req, res) => {
    try {
        const actividad = await Actividad.findById(req.params.id)
            .populate('grado', 'nombre seccion')
            .populate('materia', 'nombre');
        
        if (!actividad) {
            return res.redirect('/docente/actividades?error=Actividad no encontrada');
        }
        
        const entregas = await EntregaActividad.find({ actividad: req.params.id })
            .populate('alumno', 'nombre documento')
            .sort({ fechaEntrega: -1 });
        
        res.render('docente/entregas', {
            titulo: 'Entregas de Actividad',
            pagina: 'actividades',
            actividad,
            entregas,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error al ver entregas:', error);
        res.redirect('/docente/actividades?error=Error al cargar entregas');
    }
});

// Calificar entrega
router.post('/entregas/:id/calificar', async (req, res) => {
    try {
        const { calificacion, retroalimentacion } = req.body;
        
        const entrega = await EntregaActividad.findById(req.params.id);
        if (!entrega) {
            return res.redirect('/docente/actividades?error=Entrega no encontrada');
        }
        
        entrega.calificacion = parseFloat(calificacion);
        entrega.retroalimentacion = retroalimentacion;
        entrega.estado = 'calificada';
        entrega.fechaCalificacion = new Date();
        
        await entrega.save();
        
        res.redirect('/docente/actividades/' + entrega.actividad + '/entregas?mensaje=Entrega calificada exitosamente');
    } catch (error) {
        console.error('Error al calificar entrega:', error);
        res.redirect('/docente/actividades?error=Error al calificar entrega');
    }
});

// Eliminar actividad
router.get('/actividades/eliminar/:id', async (req, res) => {
    try {
        await Actividad.findByIdAndDelete(req.params.id);
        await EntregaActividad.deleteMany({ actividad: req.params.id });
        res.redirect('/docente/actividades?mensaje=Actividad eliminada');
    } catch (error) {
        console.error('Error al eliminar actividad:', error);
        res.redirect('/docente/actividades?error=Error al eliminar actividad');
    }
});

// ========================================
// GESTIÓN DE CALIFICACIONES (NOTAS)
// ========================================

// Listar grados y materias para calificar
router.get('/calificaciones', async (req, res) => {
    try {
        const docenteId = req.session.usuario.id;
        
        // Obtener asignaciones del docente
        const asignaciones = await AsignacionDocente.find({ 
            docente: docenteId, 
            activo: true 
        })
        .populate('grado', 'nombre seccion nivel')
        .populate('materia', 'nombre codigo');
        
        // Obtener períodos
        const periodos = await Periodo.find().sort({ numero: 1 });
        
        res.render('docente/calificaciones', {
            titulo: 'Calificaciones',
            pagina: 'calificaciones',
            asignaciones,
            periodos,
            alumnos: null,
            asignacionSeleccionada: null,
            periodoSeleccionado: null,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error al cargar calificaciones:', error);
        res.render('error', { mensaje: 'Error al cargar calificaciones', codigo: 500 });
    }
});

// Ver alumnos de un grado para calificar
router.get('/calificaciones/:asignacionId/:periodoId', async (req, res) => {
    try {
        const docenteId = req.session.usuario.id;
        const { asignacionId, periodoId } = req.params;
        
        // Obtener la asignación
        const asignacion = await AsignacionDocente.findById(asignacionId)
            .populate('grado', 'nombre seccion nivel')
            .populate('materia', 'nombre codigo');
        
        if (!asignacion) {
            return res.redirect('/docente/calificaciones?error=Asignación no encontrada');
        }
        
        // Obtener período
        const periodo = await Periodo.findById(periodoId);
        
        // Obtener alumnos matriculados en ese grado
        const matriculas = await Matricula.find({ 
            grado: asignacion.grado._id,
            estado: 'activa'
        }).populate('alumno', 'nombre documento');
        
        // Obtener notas existentes
        const notas = await Nota.find({
            grado: asignacion.grado._id,
            materia: asignacion.materia._id,
            periodo: periodoId
        });
        
        // Crear mapa de notas por alumno
        const notasPorAlumno = {};
        notas.forEach(nota => {
            notasPorAlumno[nota.alumno.toString()] = nota;
        });
        
        // Combinar alumnos con sus notas
        const alumnosConNotas = matriculas.map(m => ({
            alumno: m.alumno,
            nota: notasPorAlumno[m.alumno._id.toString()] || null
        }));
        
        // Obtener todas las asignaciones para el selector
        const asignaciones = await AsignacionDocente.find({ 
            docente: docenteId, 
            activo: true 
        })
        .populate('grado', 'nombre seccion nivel')
        .populate('materia', 'nombre codigo');
        
        const periodos = await Periodo.find().sort({ numero: 1 });
        
        res.render('docente/calificaciones', {
            titulo: 'Calificaciones',
            pagina: 'calificaciones',
            asignaciones,
            periodos,
            alumnos: alumnosConNotas,
            asignacionSeleccionada: asignacion,
            periodoSeleccionado: periodo,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error al cargar alumnos:', error);
        res.redirect('/docente/calificaciones?error=Error al cargar alumnos');
    }
});

// Guardar notas
router.post('/calificaciones/guardar', async (req, res) => {
    try {
        const docenteId = req.session.usuario.id;
        const { gradoId, materiaId, periodoId, notas } = req.body;
        
        // notas viene como objeto: { alumnoId: nota, ... }
        for (const alumnoId in notas) {
            const valorNota = parseFloat(notas[alumnoId]);
            
            if (!isNaN(valorNota)) {
                // Buscar si ya existe la nota
                const notaExistente = await Nota.findOne({
                    alumno: alumnoId,
                    materia: materiaId,
                    grado: gradoId,
                    periodo: periodoId
                });
                
                if (notaExistente) {
                    // Actualizar nota existente
                    notaExistente.nota = valorNota;
                    notaExistente.registradoPor = docenteId;
                    await notaExistente.save();
                } else {
                    // Crear nueva nota
                    const nuevaNota = new Nota({
                        alumno: alumnoId,
                        materia: materiaId,
                        grado: gradoId,
                        periodo: periodoId,
                        nota: valorNota,
                        registradoPor: docenteId
                    });
                    await nuevaNota.save();
                }
            }
        }
        
        // Buscar la asignación para redirigir
        const asignacion = await AsignacionDocente.findOne({
            docente: docenteId,
            grado: gradoId,
            materia: materiaId
        });
        
        res.redirect('/docente/calificaciones/' + asignacion._id + '/' + periodoId + '?mensaje=Notas guardadas exitosamente');
    } catch (error) {
        console.error('Error al guardar notas:', error);
        res.redirect('/docente/calificaciones?error=Error al guardar notas');
    }
});

// ========================================
// GESTIÓN DE NOTICIAS
// ========================================

// Ver y crear noticias
router.get('/noticias', async (req, res) => {
    try {
        const noticias = await Noticia.find()
            .populate('autor', 'nombre')
            .sort({ fechaPublicacion: -1 });
        
        res.render('docente/noticias', {
            titulo: 'Noticias',
            pagina: 'noticias',
            noticias,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error al cargar noticias:', error);
        res.render('error', { mensaje: 'Error al cargar noticias', codigo: 500 });
    }
});

// Crear noticia
router.post('/noticias/crear', async (req, res) => {
    try {
        const { titulo, contenido, categoria } = req.body;
        
        const nuevaNoticia = new Noticia({
            titulo,
            contenido,
            categoria,
            autor: req.session.usuario.id
        });
        
        await nuevaNoticia.save();
        res.redirect('/docente/noticias?mensaje=Noticia publicada exitosamente');
    } catch (error) {
        console.error('Error al crear noticia:', error);
        res.redirect('/docente/noticias?error=Error al publicar noticia');
    }
});

module.exports = router;
