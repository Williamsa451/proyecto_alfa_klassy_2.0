// ========================================
// RUTAS DEL ADMINISTRADOR
// CRUD completo de usuarios, grados, materias, etc.
// ========================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { soloAdmin } = require('../middleware/autenticacion');

// Importar todos los modelos
const { 
    Usuario, 
    Grado, 
    Materia, 
    Periodo, 
    Matricula, 
    AsignacionDocente,
    Noticia,
    Actividad,
    Nota
} = require('../modelos');

// Aplicar middleware de autenticación a todas las rutas
router.use(soloAdmin);

// ========================================
// DASHBOARD PRINCIPAL
// ========================================
router.get('/dashboard', async (req, res) => {
    try {
        // Obtener estadísticas
        const totalUsuarios = await Usuario.countDocuments();
        const totalAlumnos = await Usuario.countDocuments({ rol: 'alumno' });
        const totalDocentes = await Usuario.countDocuments({ rol: 'docente' });
        const totalGrados = await Grado.countDocuments();
        const totalMaterias = await Materia.countDocuments();
        const totalMatriculas = await Matricula.countDocuments({ estado: 'activa' });
        
        // Obtener últimas noticias
        const noticias = await Noticia.find()
            .populate('autor', 'nombre')
            .sort({ fechaPublicacion: -1 })
            .limit(5);

        res.render('admin/dashboard', {
            titulo: 'Dashboard',
            pagina: 'dashboard',
            estadisticas: {
                totalUsuarios,
                totalAlumnos,
                totalDocentes,
                totalGrados,
                totalMaterias,
                totalMatriculas
            },
            noticias
        });
    } catch (error) {
        console.error('Error en dashboard admin:', error);
        res.render('error', { mensaje: 'Error al cargar el dashboard', codigo: 500 });
    }
});

// ========================================
// CRUD DE USUARIOS
// ========================================

// Listar usuarios
router.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find().sort({ fechaCreacion: -1 });
        res.render('admin/usuarios', {
            titulo: 'Gestión de Usuarios',
            pagina: 'usuarios',
            usuarios,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.render('error', { mensaje: 'Error al cargar usuarios', codigo: 500 });
    }
});

// Formulario para crear usuario
router.get('/usuarios/crear', (req, res) => {
    res.render('admin/usuarios-formulario', {
        titulo: 'Crear Usuario',
        pagina: 'usuarios',
        usuario: req.session.usuario,
        usuarioFormulario:null,
        error: null
    });
});

// Guardar nuevo usuario
router.post('/usuarios/crear', async (req, res) => {
    try {
        const { nombre, correo, contrasena, rol, documento, telefono, direccion } = req.body;
        
        // Verificar si ya existe el correo
        const existeCorreo = await Usuario.findOne({ correo });
        if (existeCorreo) {
            return res.render('admin/usuarios-formulario', {
                titulo: 'Crear Usuario',
                pagina: 'usuarios',
                usuarioFormulario: req.body,
                error: 'El correo ya está registrado'
            });
        }
        
        // Verificar si ya existe el documento
        const existeDocumento = await Usuario.findOne({ documento });
        if (existeDocumento) {
            return res.render('admin/usuarios-formulario', {
                titulo: 'Crear Usuario',
                pagina: 'usuarios',
                usuarioFormulario: req.body,
                error: 'El documento ya está registrado'
            });
        }
        
        // Encriptar contraseña
        const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);
        
        // Crear usuario
        const nuevoUsuario = new Usuario({
            nombre,
            correo: correo.toLowerCase(),
            contrasena: contrasenaEncriptada,
            rol,
            documento,
            telefono,
            direccion
        });
        
        await nuevoUsuario.save();
        
        res.redirect('/admin/usuarios?mensaje=Usuario creado exitosamente');
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.render('admin/usuarios-formulario', {
            titulo: 'Crear Usuario',
            pagina: 'usuarios',
            usuarioFormulario: req.body,
            error: 'Error al crear el usuario'
        });
    }
});

// Formulario para editar usuario
router.get('/usuarios/editar/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            return res.redirect('/admin/usuarios?error=Usuario no encontrado');
        }
        
        res.render('admin/usuarios-formulario', {
            titulo: 'Editar Usuario',
            pagina: 'usuarios',
            usuarioFormulario: usuario,
            error: null
        });
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        res.redirect('/admin/usuarios?error=Error al cargar usuario');
    }
});

// Actualizar usuario
router.post('/usuarios/editar/:id', async (req, res) => {
    try {
        const { nombre, correo, contrasena, rol, documento, telefono, direccion, activo } = req.body;
        
        const datosActualizar = {
            nombre,
            correo: correo.toLowerCase(),
            rol,
            documento,
            telefono,
            direccion,
            activo: activo === 'on'
        };
        
        // Solo actualizar contraseña si se proporcionó una nueva
        if (contrasena && contrasena.trim() !== '') {
            datosActualizar.contrasena = await bcrypt.hash(contrasena, 10);
        }
        
        await Usuario.findByIdAndUpdate(req.params.id, datosActualizar);
        
        res.redirect('/admin/usuarios?mensaje=Usuario actualizado exitosamente');
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.redirect('/admin/usuarios?error=Error al actualizar usuario');
    }
});

// Eliminar usuario
router.get('/usuarios/eliminar/:id', async (req, res) => {
    try {
        await Usuario.findByIdAndDelete(req.params.id);
        res.redirect('/admin/usuarios?mensaje=Usuario eliminado exitosamente');
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.redirect('/admin/usuarios?error=Error al eliminar usuario');
    }
});

// ========================================
// CRUD DE GRADOS
// ========================================

// Listar grados
router.get('/grados', async (req, res) => {
    try {
        const grados = await Grado.find().sort({ nivel: 1, nombre: 1 });
        res.render('admin/grados', {
            titulo: 'Gestión de Grados',
            pagina: 'grados',
            grados,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error al listar grados:', error);
        res.render('error', { mensaje: 'Error al cargar grados', codigo: 500 });
    }
});

// Crear grado
router.post('/grados/crear', async (req, res) => {
    try {
        const { nombre, seccion, nivel, anioEscolar, capacidad } = req.body;
        
        const nuevoGrado = new Grado({
            nombre,
            seccion,
            nivel,
            anioEscolar,
            capacidad: parseInt(capacidad) || 30
        });
        
        await nuevoGrado.save();
        res.redirect('/admin/grados?mensaje=Grado creado exitosamente');
    } catch (error) {
        console.error('Error al crear grado:', error);
        res.redirect('/admin/grados?error=Error al crear grado');
    }
});

// Editar grado
router.post('/grados/editar/:id', async (req, res) => {
    try {
        const { nombre, seccion, nivel, anioEscolar, capacidad, activo } = req.body;
        
        await Grado.findByIdAndUpdate(req.params.id, {
            nombre,
            seccion,
            nivel,
            anioEscolar,
            capacidad: parseInt(capacidad) || 30,
            activo: activo === 'on'
        });
        
        res.redirect('/admin/grados?mensaje=Grado actualizado exitosamente');
    } catch (error) {
        console.error('Error al actualizar grado:', error);
        res.redirect('/admin/grados?error=Error al actualizar grado');
    }
});

// Eliminar grado
router.get('/grados/eliminar/:id', async (req, res) => {
    try {
        await Grado.findByIdAndDelete(req.params.id);
        res.redirect('/admin/grados?mensaje=Grado eliminado exitosamente');
    } catch (error) {
        console.error('Error al eliminar grado:', error);
        res.redirect('/admin/grados?error=Error al eliminar grado');
    }
});

// ========================================
// CRUD DE MATERIAS
// ========================================

// Listar materias
router.get('/materias', async (req, res) => {
    try {
        const materias = await Materia.find().sort({ nombre: 1 });
        res.render('admin/materias', {
            titulo: 'Gestión de Materias',
            pagina: 'materias',
            materias,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error al listar materias:', error);
        res.render('error', { mensaje: 'Error al cargar materias', codigo: 500 });
    }
});

// Crear materia
router.post('/materias/crear', async (req, res) => {
    try {
        const { nombre, codigo, descripcion, nivel } = req.body;
        
        const nuevaMateria = new Materia({
            nombre,
            codigo: codigo.toUpperCase(),
            descripcion,
            nivel
        });
        
        await nuevaMateria.save();
        res.redirect('/admin/materias?mensaje=Materia creada exitosamente');
    } catch (error) {
        console.error('Error al crear materia:', error);
        res.redirect('/admin/materias?error=Error al crear materia. El código puede estar duplicado.');
    }
});

// Editar materia
router.post('/materias/editar/:id', async (req, res) => {
    try {
        const { nombre, codigo, descripcion, nivel, activo } = req.body;
        
        await Materia.findByIdAndUpdate(req.params.id, {
            nombre,
            codigo: codigo.toUpperCase(),
            descripcion,
            nivel,
            activo: activo === 'on'
        });
        
        res.redirect('/admin/materias?mensaje=Materia actualizada exitosamente');
    } catch (error) {
        console.error('Error al actualizar materia:', error);
        res.redirect('/admin/materias?error=Error al actualizar materia');
    }
});

// Eliminar materia
router.get('/materias/eliminar/:id', async (req, res) => {
    try {
        await Materia.findByIdAndDelete(req.params.id);
        res.redirect('/admin/materias?mensaje=Materia eliminada exitosamente');
    } catch (error) {
        console.error('Error al eliminar materia:', error);
        res.redirect('/admin/materias?error=Error al eliminar materia');
    }
});

// ========================================
// CRUD DE PERÍODOS
// ========================================

// Listar períodos
router.get('/periodos', async (req, res) => {
    try {
        const periodos = await Periodo.find().sort({ anioEscolar: -1, numero: 1 });
        res.render('admin/periodos', {
            titulo: 'Gestión de Períodos',
            pagina: 'periodos',
            periodos,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error al listar períodos:', error);
        res.render('error', { mensaje: 'Error al cargar períodos', codigo: 500 });
    }
});

// Crear período
router.post('/periodos/crear', async (req, res) => {
    try {
        const { nombre, numero, anioEscolar, fechaInicio, fechaFin, activo } = req.body;
        
        const nuevoPeriodo = new Periodo({
            nombre,
            numero: parseInt(numero),
            anioEscolar,
            fechaInicio: new Date(fechaInicio),
            fechaFin: new Date(fechaFin),
            activo: activo === 'on'
        });
        
        await nuevoPeriodo.save();
        res.redirect('/admin/periodos?mensaje=Período creado exitosamente');
    } catch (error) {
        console.error('Error al crear período:', error);
        res.redirect('/admin/periodos?error=Error al crear período');
    }
});

// Editar período
router.post('/periodos/editar/:id', async (req, res) => {
    try {
        const { nombre, numero, anioEscolar, fechaInicio, fechaFin, activo } = req.body;
        
        await Periodo.findByIdAndUpdate(req.params.id, {
            nombre,
            numero: parseInt(numero),
            anioEscolar,
            fechaInicio: new Date(fechaInicio),
            fechaFin: new Date(fechaFin),
            activo: activo === 'on'
        });
        
        res.redirect('/admin/periodos?mensaje=Período actualizado exitosamente');
    } catch (error) {
        console.error('Error al actualizar período:', error);
        res.redirect('/admin/periodos?error=Error al actualizar período');
    }
});

// Eliminar período
router.get('/periodos/eliminar/:id', async (req, res) => {
    try {
        await Periodo.findByIdAndDelete(req.params.id);
        res.redirect('/admin/periodos?mensaje=Período eliminado exitosamente');
    } catch (error) {
        console.error('Error al eliminar período:', error);
        res.redirect('/admin/periodos?error=Error al eliminar período');
    }
});

// ========================================
// GESTIÓN DE MATRÍCULAS
// ========================================

// Listar matrículas
router.get('/matriculas', async (req, res) => {
    try {
        const matriculas = await Matricula.find()
            .populate('alumno', 'nombre documento correo')
            .populate('grado', 'nombre seccion nivel')
            .sort({ fechaMatricula: -1 });
        
        const alumnos = await Usuario.find({ rol: 'alumno', activo: true });
        const grados = await Grado.find({ activo: true });
        
        res.render('admin/matriculas', {
            titulo: 'Gestión de Matrículas',
            pagina: 'matriculas',
            matriculas,
            alumnos,
            grados,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error al listar matrículas:', error);
        res.render('error', { mensaje: 'Error al cargar matrículas', codigo: 500 });
    }
});

// Crear matrícula
router.post('/matriculas/crear', async (req, res) => {
    try {
        const { alumno, grado, anioEscolar, observaciones } = req.body;
        
        // Verificar si ya existe matrícula activa
        const matriculaExistente = await Matricula.findOne({
            alumno,
            anioEscolar,
            estado: 'activa'
        });
        
        if (matriculaExistente) {
            return res.redirect('/admin/matriculas?error=El alumno ya tiene una matrícula activa este año');
        }
        
        const nuevaMatricula = new Matricula({
            alumno,
            grado,
            anioEscolar,
            observaciones
        });
        
        await nuevaMatricula.save();
        res.redirect('/admin/matriculas?mensaje=Matrícula creada exitosamente');
    } catch (error) {
        console.error('Error al crear matrícula:', error);
        res.redirect('/admin/matriculas?error=Error al crear matrícula');
    }
});

// Cambiar estado de matrícula
router.post('/matriculas/estado/:id', async (req, res) => {
    try {
        const { estado } = req.body;
        await Matricula.findByIdAndUpdate(req.params.id, { estado });
        res.redirect('/admin/matriculas?mensaje=Estado de matrícula actualizado');
    } catch (error) {
        console.error('Error al actualizar matrícula:', error);
        res.redirect('/admin/matriculas?error=Error al actualizar matrícula');
    }
});

// ========================================
// GESTIÓN DE ASIGNACIONES DE DOCENTES
// ========================================

// Listar asignaciones
router.get('/asignaciones', async (req, res) => {
    try {
        const asignaciones = await AsignacionDocente.find()
            .populate('docente', 'nombre correo')
            .populate('grado', 'nombre seccion nivel')
            .populate('materia', 'nombre codigo')
            .sort({ fechaCreacion: -1 });
        
        const docentes = await Usuario.find({ rol: 'docente', activo: true });
        const grados = await Grado.find({ activo: true });
        const materias = await Materia.find({ activo: true });
        
        res.render('admin/asignaciones', {
            titulo: 'Asignación de Docentes',
            pagina: 'asignaciones',
            asignaciones,
            docentes,
            grados,
            materias,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error al listar asignaciones:', error);
        res.render('error', { mensaje: 'Error al cargar asignaciones', codigo: 500 });
    }
});

// Crear asignación
router.post('/asignaciones/crear', async (req, res) => {
    try {
        const { docente, grado, materia, anioEscolar } = req.body;
        
        // Verificar si ya existe la asignación
        const asignacionExistente = await AsignacionDocente.findOne({
            docente,
            grado,
            materia,
            anioEscolar
        });
        
        if (asignacionExistente) {
            return res.redirect('/admin/asignaciones?error=Esta asignación ya existe');
        }
        
        const nuevaAsignacion = new AsignacionDocente({
            docente,
            grado,
            materia,
            anioEscolar
        });
        
        await nuevaAsignacion.save();
        res.redirect('/admin/asignaciones?mensaje=Asignación creada exitosamente');
    } catch (error) {
        console.error('Error al crear asignación:', error);
        res.redirect('/admin/asignaciones?error=Error al crear asignación');
    }
});

// Eliminar asignación
router.get('/asignaciones/eliminar/:id', async (req, res) => {
    try {
        await AsignacionDocente.findByIdAndDelete(req.params.id);
        res.redirect('/admin/asignaciones?mensaje=Asignación eliminada exitosamente');
    } catch (error) {
        console.error('Error al eliminar asignación:', error);
        res.redirect('/admin/asignaciones?error=Error al eliminar asignación');
    }
});

// ========================================
// GESTIÓN DE NOTICIAS
// ========================================

// Listar noticias
router.get('/noticias', async (req, res) => {
    try {
        const noticias = await Noticia.find()
            .populate('autor', 'nombre')
            .sort({ fechaPublicacion: -1 });
        
        res.render('admin/noticias', {
            titulo: 'Gestión de Noticias',
            pagina: 'noticias',
            noticias,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Error al listar noticias:', error);
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
        res.redirect('/admin/noticias?mensaje=Noticia publicada exitosamente');
    } catch (error) {
        console.error('Error al crear noticia:', error);
        res.redirect('/admin/noticias?error=Error al publicar noticia');
    }
});

// Eliminar noticia
router.get('/noticias/eliminar/:id', async (req, res) => {
    try {
        await Noticia.findByIdAndDelete(req.params.id);
        res.redirect('/admin/noticias?mensaje=Noticia eliminada exitosamente');
    } catch (error) {
        console.error('Error al eliminar noticia:', error);
        res.redirect('/admin/noticias?error=Error al eliminar noticia');
    }
});

module.exports = router;
