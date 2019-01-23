var express = require('express');
var bcrypt = require('bcryptjs'); // npm install para las contraseñas
var jwt = require('jsonwebtoken'); // npm install token
var SEED = require('../configuraciones/config').SEED; // Esta es mi clave para el TOKEN

var Usuario = require('../modelos/usuario'); // Schema Usuario
// Google
const CLIENT_ID = require('../configuraciones/config').CLIENT_ID;
const CLIENT_SECRET = require('../configuraciones/config').CLIENT_SECRET;
// Middleware
var middleware = require('../middlewares/autentificacion');
const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var app = express();


// ========================
//  Autenticación de Google
// ========================
app.post('/google', (req, res) => {

    var token = req.body.token;
    console.log(req.body.token);
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });


        const payload = ticket.getPayload();
        const userid = payload['sub']; // email picture name 

        // Quien Inicio Sesion ?
        Usuario.findOne({
            email: payload.email
        }, (err, usuario) => {
            if (err) {
                return status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario-login'
                });
            }
            // Esta registrado esa cuenta de GOOGLE ?
            if (usuario) {
                if (usuario.google === false) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Su autenticacion se realizo por Registrarse'
                    });
                } else {
                    // Crear Token
                    usuario.password = ':)';
                    var token = jwt.sign({ // Inicia sesion y los datos son almacenados 
                        usuario: usuario
                    }, SEED, {
                        expiresIn: 14400
                    }); // 4horas
                    res.status(200).json({
                        ok: true,
                        usuario,
                        id: usuario._id,
                        token: token,
                        menu: obtenerMenu(usuario.role)
                    });
                }
            } else { // Usuario no registrado
                var nuevoUsuario = new Usuario();
                nuevoUsuario.nombre = payload.name;
                nuevoUsuario.email = payload.email;
                nuevoUsuario.password = ':)'; // Ver Modelo Usuario, el password es REQUIRED
                nuevoUsuario.img = payload.picture;
                nuevoUsuario.google = true;

                nuevoUsuario.save((err, usuario) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al crear Usuario - Google',
                            error: err
                        });
                    }
                    // Crear Token
                    var token = jwt.sign({ // Inicia sesion y los datos son almacenados 
                        usuario: usuario
                    }, SEED, {
                        expiresIn: 14400
                    }); // 4horas
                    res.status(200).json({
                        ok: true,
                        usuario,
                        mensaje: 'Usuario Creado - Google',
                        id: usuario._id,
                        token: token,
                        menu: obtenerMenu(usuario.role)
                    });
                });

            }



        });



    }
    verify().catch((error) => {
        res.status(400).json({
            ok: 'false',
            error: 'error de token'
        });
    });

});
// ==================
// Renueva Token
// ==================
app.get('/renuevatoken', middleware.verificaToken, (req, res) => {

    var nuevoToken = jwt.sign({ // Inicia sesion y los datos son almacenados 
        usuario: req.usuario // Usuario Actual
    }, SEED, {
        expiresIn: 14400
    }); // 4horas 
    return res.status(200).json({
        ok: true,
        token: nuevoToken
    });
});

// ========================
// Autenticación Normal
// ========================
app.post('/', (req, res, next) => {

    var body = req.body;

    Usuario.findOne({
        email: body.email
    }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuario',
                errors: err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Login incorrecto - email',
                errors: {
                    error: 'Login Incorrecto'
                }
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Login Incorrecto - password',
                errors: {
                    error: 'Login Incorrecto - password'
                }
            });
        }
        // Crear Token
        usuarioDB.password = ':)';
        var token = jwt.sign({ // Inicia sesion y los datos son almacenados 
            usuario: usuarioDB
        }, SEED, {
            expiresIn: 14400
        }); // 4horas
        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB._id,
            token: token,
            menu: obtenerMenu(usuarioDB.role)
        });

    });

});


function obtenerMenu(ROLE) {
    var menu = [{
        titulo: 'Principal',
        icono: 'fa fa-dashboard',
        submenu: [{
                titulo: 'Grafico',
                url: '/tablero'
            },
            {
                titulo: 'Ajustes de Cuenta',
                url: '/configuraciones'
            },
        ]
    }, {
        titulo: 'Mantenimiento',
        icono: 'fa fa-folder-open',
        submenu: [
            //    { titulo: 'usuarios', url: '/usuarios' },
            {
                titulo: 'Héroes',
                url: '/heroes'
            },
        ]
    }, {
        titulo: 'Material',
        icono: 'fa fa-folder-open',
        submenu: [
            //    { titulo: 'usuarios', url: '/usuarios' },
            {
                titulo: 'Héroes',
                url: '/materialHeroes'
            }, {
                titulo: 'Formulario Reactivo',
                url: '/formulario1'
            }, {
                titulo: 'Formulario Reactivo',
                url: '/formulario2'
            },

        ]
    }, ];
    if (ROLE === 'ADMIN_ROLE') {
        // Push coloca un elemento al final, y el unshift al INICIO
        menu[1].submenu.unshift({
            titulo: 'Usuarios',
            url: '/usuarios'
        });
        // push aMaterial
        menu[2].submenu.unshift({
            titulo: 'Usuarios',
            url: '/materialUsuarios'
        });
    }
    return menu;

}

module.exports = app;