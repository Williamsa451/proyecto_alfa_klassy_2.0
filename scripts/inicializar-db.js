// SCRIPT PARA INICIALIZAR LA BASE DE DATOS
// crea un admin para verificacion de perfil y algunos datos de ejemplo para pruebas
// Ejecutar con: node scripts/inicializar-db.js
/* nota este archivo se debe que ejecutar por primera vez para 
crear el admin y los datos de ejemplo  para que no bote error*/

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Importar modelos
const Usuario = require('../modelos/Usuario')
const Grado = require('../modelos/Grado')
const Materia = require('../modelos/Materia')
const Periodo = require('../modelos/Periodo')

// URL de la base de datos
const URL_MONGODB = 'mongodb://localhost:27017/db_klassy_final'

// Función principal
async function inicializarBaseDeDatos() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(URL_MONGODB);
        console.log(' Conectado a Mongodb')
        
        // Verificar si ya existe un admin
        const adminExistente = await Usuario.findOne({ rol: 'admin' })
        
        if (adminExistente) {
            console.log('   Ya existe un usuario administrador')
            console.log('   Correo: ' + adminExistente.correo)
        } else {
            // Crear usuario administrador
            const contrasenaEncriptada = await bcrypt.hash('123456', 10)
            
            const admin = new Usuario({
                nombre: 'Administrador',
                correo: 'admin@gmail.com',
                contrasena: contrasenaEncriptada,
                rol: 'admin',
                documento: '00000001',
                telefono: '555-0000',
                direccion: 'Oficina Principal'
            });
            
            await admin.save();
            console.log('   Usuario administrador creado')
            console.log('   Correo: admin@gmail.com')
            console.log('   Contraseña: 123456')
        }
        
        // Crear algunos grados de ejemplo
        const gradosExistentes = await Grado.countDocuments()
        if (gradosExistentes === 0) {
            const grados = [
                { nombre: '1er Grado', seccion: 'A', nivel: 'primaria', anioEscolar: '2025' },
                { nombre: '2do Grado', seccion: 'A', nivel: 'primaria', anioEscolar: '2025' },
                { nombre: '3er Grado', seccion: 'A', nivel: 'primaria', anioEscolar: '2025' },
                { nombre: '1er Año', seccion: 'A', nivel: 'secundaria', anioEscolar: '2025' },
                { nombre: '2do Año', seccion: 'A', nivel: 'secundaria', anioEscolar: '2025' },
                { nombre: '3er Año', seccion: 'A', nivel: 'secundaria', anioEscolar: '2025' },
            ];
            
            await Grado.insertMany(grados);
            console.log('Grados de ejemplo creados')
        }
        
        // Crear algunas materias de ejemplo
        const materiasExistentes = await Materia.countDocuments();
        if (materiasExistentes === 0) {
            const materias = [
                { nombre: 'Matemáticas', codigo: 'MAT', descripcion: 'Aritmética, álgebra y geometría', nivel: 'ambos' },
                { nombre: 'Español', codigo: 'ESP', descripcion: 'Lengua y literatura', nivel: 'ambos' },
                { nombre: 'Ciencias Naturales', codigo: 'CNA', descripcion: 'Biología, física y química', nivel: 'ambos' },
                { nombre: 'Historia', codigo: 'HIS', descripcion: 'Historia universal y local', nivel: 'ambos' },
                { nombre: 'Geografía', codigo: 'GEO', descripcion: 'Geografía física y política', nivel: 'ambos' },
                { nombre: 'Educación Física', codigo: 'EFI', descripcion: 'Actividades físicas y deportes', nivel: 'ambos' },
                { nombre: 'Inglés', codigo: 'ING', descripcion: 'Idioma inglés', nivel: 'ambos' },
                { nombre: 'Arte', codigo: 'ART', descripcion: 'Artes plásticas y música', nivel: 'ambos' },
            ];
            
            await Materia.insertMany(materias);
            console.log('   Materias de ejemplo creadas');
        }
        
        // Crear períodos de ejemplo
        const periodosExistentes = await Periodo.countDocuments();
        if (periodosExistentes === 0) {
            const periodos = [
                { 
                    nombre: 'Primer Bimestre', 
                    numero: 1, 
                    anioEscolar: '2025',
                    fechaInicio: new Date('2025-02-01'),
                    fechaFin: new Date('2025-04-15'),
                    activo: true
                },
                { 
                    nombre: 'Segundo Bimestre', 
                    numero: 2, 
                    anioEscolar: '2025',
                    fechaInicio: new Date('2025-04-16'),
                    fechaFin: new Date('2025-06-30'),
                    activo: false
                },
                { 
                    nombre: 'Tercer Bimestre', 
                    numero: 3, 
                    anioEscolar: '2025',
                    fechaInicio: new Date('2025-08-01'),
                    fechaFin: new Date('2025-10-15'),
                    activo: false
                },
                { 
                    nombre: 'Cuarto Bimestre', 
                    numero: 4, 
                    anioEscolar: '2025',
                    fechaInicio: new Date('2025-10-16'),
                    fechaFin: new Date('2025-12-15'),
                    activo: false
                },
            ];
            
            await Periodo.insertMany(periodos);
            console.log('   Períodos de ejemplo creados');
        }

        const directorExistente = await Usuario.findOne({ correo: 'director@gmail.com' });
        if (!directorExistente) {
            const contrasenaDocente = await bcrypt.hash('123456', 10);
            const director = new Usuario({
                nombre: 'Jhon cuervo',
                correo: 'director@gmail.com',
                contrasena: contrasenaDocente,
                rol: 'director',
                documento: '00000004',
                telefono: '555-3333',
                direccion: 'Calle Principal 321'
            });
            await director.save();
            console.log('   Director de prueba creado');
            console.log('   Correo: director@gmail.com');
            console.log('   Contraseña: 123456');
        }
        
        // Crear un docente de prueba
        const docenteExistente = await Usuario.findOne({ correo: 'docente@gmail.com' });
        if (!docenteExistente) {
            const contrasenaDocente = await bcrypt.hash('123456', 10);
            const docente = new Usuario({
                nombre: 'María García',
                correo: 'docente@gmail.com',
                contrasena: contrasenaDocente,
                rol: 'docente',
                documento: '00000002',
                telefono: '555-1111',
                direccion: 'Calle Principal 123'
            });
            await docente.save();
            console.log('   Docente de prueba creado');
            console.log('   Correo: docente@gmail.com');
            console.log('   Contraseña: 123456');
        }
        //pongo esto para que salga en la terminal para que sepan como se ingresar al perfil de docente
        
        // Crear un alumno de prueba
        const alumnoExistente = await Usuario.findOne({ correo: 'alumno@gmail.com' });
        if (!alumnoExistente) {
            const contrasenaAlumno = await bcrypt.hash('123456', 10);
            const alumno = new Usuario({
                nombre: 'Juan Pérez',
                correo: 'alumno@gmail.com',
                contrasena: contrasenaAlumno,
                rol: 'alumno',
                documento: '00000003',
                telefono: '555-2222',
                direccion: 'Avenida Central 456'
            });
            await alumno.save();
            console.log('   Alumno de prueba creado');
            console.log('   Correo: alumno@gmail.com');
            console.log('   Contraseña: 123456');
        }
        
        console.log('   -NOTA IMPORTANTE:');
        console.log('   - El docente necesita una ASIGNACIÓN activa para acceder');
        console.log('   - El alumno necesita una MATRÍCULA activa para acceder');
        console.log('   - Usa el admin para crear asignaciones y matrículas');
        //validaciones que el señorito chamo quiso
        
    } catch (error) {
        console.error('  Error al inicializar la base de datos:', error);
    } finally {
        // Cerrar conexión
        await mongoose.disconnect();
        console.log('  Conexión cerrada');
    }
}

// cuando se ejecuta el archivo esto llama la funcion anterior
inicializarBaseDeDatos();
