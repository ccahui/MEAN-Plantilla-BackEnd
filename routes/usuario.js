var express = require('express');
var app = express();
var Usuario = require('../modelos/usuario'); // Schema Usuario
var bcrypt = require('bcryptjs'); // npm install para las contraseñas

var middleware = require('../middlewares/autentificacion'); // Autentificacion TOKEN
//ROLE
const ADMIN_ROLE = require('../configuraciones/config').ADMIN_ROLE;

// ==============================
// Obtener todos los Usuarios
// ==============================
app.get('/', (req, res) => {
    // Especificando los campos devueltos
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde) // Especificamos un salto para iniciar
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Usuarios',
                        errors: err
                    });
                }
                Usuario.count({}, (err, conteo) => { // Paginacion
                    res.status(200).json({
                        ok: true,
                        total: conteo, // Total de Usuarios
                        usuarios: usuarios
                    });
                });
            });

});


// ==============================
// Crear Nuevo Usuario
// ==============================
app.post('/', (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password), // Bcrypt para la contraseña
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando Usuarios',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});

// ==============================
// Actualizar Usuario
// ==============================
app.put('/:id', [middleware.verificaToken, middleware.verificaADMIN_o_USER], (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, usuarioBuscado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar Usuario"
            });
        }
        if (!usuarioBuscado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: {
                    messaje: 'No existe un usuario con ese ID'
                }

            });
        }

        usuarioBuscado.nombre = body.nombre;

        //Usuario Login : Validacion en el backend
        var usuarioLogin = req.usuario;
        if (!usuarioLogin.google) {
            usuarioBuscado.email = body.email;
        }
        if (usuarioLogin.role === ADMIN_ROLE) {
            usuarioBuscado.role = body.role;
        }


        usuarioBuscado.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar Usuario',
                    errors: err
                });
            }
            usuarioBuscado.password = ':)'; // Esto no se esta guardando con SAVE
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });
    });
});

// ==============================
// Eliminar Usuario
// ==============================
app.delete('/:id', [middleware.verificaToken, middleware.verificaADMIN_o_USER], (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un Usuario con ese ID',
                errors: {
                    messaje: 'No existe un Usuario con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});


module.exports = app;