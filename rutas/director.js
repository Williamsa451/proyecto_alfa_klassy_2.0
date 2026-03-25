const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { soloDirector } = require('../middleware/autenticacion');

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

router.use(soloDirector);

router.get('/dashboard', async (req, res) => {
    try {
        // Obtener estadísticas
        const totalUsuarios = await Usuario.countDocuments();
        const totalAlumnos = await Usuario.countDocuments({ rol: 'alumno' });
        const totalDocentes = await Usuario.countDocuments({ rol: 'docente' });
        const totalGrados = await Grado.countDocuments();
        const totalMaterias = await Materia.countDocuments();
        const totalMatriculas = await Matricula.countDocuments({ estado: 'activa' });
        

        res.render('director/dashboard', {
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
        });
    } catch (error) {
        console.error('Error en dashboard director:', error);
        res.render('error', { mensaje: 'Error al cargar el dashboard', codigo: 500 });
    }
});

module.exports = router;