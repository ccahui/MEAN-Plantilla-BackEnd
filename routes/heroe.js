var express = require('express');
var app = express();
var Heroe = require('../modelos/heroe');
var middleware = require('../middlewares/autentificacion');


// ==============================
// Obtener todos los path /heroe  Heroes
// ==============================
app.get('/', (req, res) => {
    Heroe.find({})
        .populate('usuario', 'nombre email') // Campos de Usuario que debemos especificar
        .exec((err, heroes) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando Heroes',
                    errors: err
                });
            }

            Heroe.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    total: conteo,
                    heroes
                });
            });

        });
});

// ==============================
// Obtener un Heroe
// ==============================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Heroe.findById(id, (err, heroe) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Obtener Heroe'
            });
        }
        if (!heroe) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Heroe ' + id + ' no existe',
                errors: {
                    messaje: 'No existe heroe con ese ID'
                }
            });
        }
        res.status(200).json({
            ok: true,
            heroe
        });
    });
});

// ==============================
// Crear Nuevo Heroe
// ==============================
app.post('/', middleware.verificaToken, (req, res) => {
    var body = req.body;

    var heroe = new Heroe({
        nombre: body.nombre,
        img: body.img,
        descripcion: body.descripcion,
        superPoder: body.superPoder,
        usuario: req.usuario._id // Dato Obtenido gracias el middleware que verifica la autenticacion de un Usuario, y guarda el dato en req.usuario
    });

    heroe.save((err, heroeGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando Heroe',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            heroe: heroeGuardado,
            usuario: req.usuario
        });

    });

});

// ==============================
// Actualizar Heroe
// ==============================
app.put('/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Heroe.findById(id, (err, heroeBuscado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar Heroe"
            });
        }
        if (!heroeBuscado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Heroe con el id ' + id + ' no existe',
                errors: {
                    messaje: 'No existe un Heroe con ese ID'
                }

            });
        }

        heroeBuscado.nombre = body.nombre;
        heroeBuscado.descripcion = body.descripcion;
        heroeBuscado.superPoder = body.superPoder;
        heroeBuscado.usuario = req.usuario._id;

        heroeBuscado.save((err, heroeGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar Heroe',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                heroe: heroeGuardado
            });

        });
    });
});

// ==============================
// Eliminar Heroe
// ==============================
app.delete('/:id', middleware.verificaToken, (req, res) => {
    var id = req.params.id;

    Heroe.findByIdAndRemove(id, (err, heroeBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Heroe',
                errors: err
            });
        }
        if (!heroeBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un Heroe con ese ID',
                errors: {
                    messaje: 'No existe un Heroe con ese ID'
                }
            });
        }
        res.status(200).json({
            ok: true,
            heroe: heroeBorrado
        });

    });

});


module.exports = app; 