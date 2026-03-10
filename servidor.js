
//////////////////////
/*si va a ejecutar esto por primera vez, asegurese sahira y jessica de ejecutar 
el siguiente comando node scripts/inicializar-db.js para que no les vaya a botar error*/
///////////////////7/


//middleware es practicamente la comunicacion que hay entre archivos
//perdon sahira o jessica si no entienden pero pailas es lo mejor que pude explicar
//xddddddddddddddddd 


//////////////////////////////7
//para que se den cuenta de esto rapido la base de datos se llamas db_klassy_final
/////////////////////////////////

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const mongoose = require('mongoose');

// Crear la aplicación de Express
const app = express();

/*creacion del enlace con la base de datos y verificacion que este conectada */

const URL_MONGODB = 'mongodb://localhost:27017/db_klassy_final';

mongoose.connect(URL_MONGODB)
    .then(() => {
        console.log('   conectado con la base de datos');
    })
    .catch((error) => {
        console.error('     no se pudo conectar con la base de datos posible erro no hayas encendido mongodb:', error.message);
    });

/* configuracion basi de express*/

// Configurar EJS como motor de vistas
/* crea un tipo de enlace con la carpeta de vistas para poder acceder a ella */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'vistas'));

// Middleware para procesar datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//aqui es donde accedes a la carpeta publica esta normalmente se usa 
//para usar archivos css y js que se usan en multiple vistas
app.use(express.static(path.join(__dirname, 'publico')));

// aqui en este bloque de codigo sirve para arracar express session
//y proteger las claves del usuario y guarda sesiones en mongodb como sessiones
//estas sesiones se guardan en las kukis por 24 horas y si no se actualiza
//o se elimina el usuarios 
app.use(session({
    secret: 'clave_ultra_secreta_que_ningun_chamo_la_va_a_conseguir',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: URL_MONGODB,
        collectionName: 'sesiones'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}));

// Middleware para pasar datos del usuario a todas las vistas
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

///////////////////////
//  aqui empieza los distintos redireccionamientos a las distintas rutas
///////////////////////



// Rutas de autenticación
const rutasAutenticacion = require('./rutas/autenticacion');
app.use('/', rutasAutenticacion);



// Rutas del administrador
const rutasAdmin = require('./rutas/admin');
app.use('/admin', rutasAdmin);


// /////////////////////////////////////////
// PÁGINA PRINCIPAL
// ////////////////////////////////////////


app.get('/', (req, res) => {
    // aqui redirecciona para cada vista de usuario
    if (req.session.usuario) {
        const rol = req.session.usuario.rol;
        if (rol === 'admin') return res.redirect('/admin/dashboard');
        if (rol === 'docente') return res.redirect('/docente/dashboard');
        if (rol === 'alumno') return res.redirect('/alumno/dashboard');
        if (rol === 'director') return res.redirect('/director/dashboard');
    }
    // Si no hay sesión lo redirecciona al login
    res.redirect('/login');
});

// ========================================
// MANEJO DE ERRORES
// ========================================
app.use((req, res) => {
    res.status(404).render('error', { 
        mensaje: 'Página no encontrada',
        codigo: 404
    });  
});

// ========================================
// INICIAR SERVIDOR
// ========================================
const PUERTO = 3000;

app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en el puerto ${PUERTO} por si no sabian`);
});
