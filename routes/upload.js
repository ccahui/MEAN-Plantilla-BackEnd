var express = require('express');
var fileUpload = require('express-fileupload');
var app = express();

var Usuario = require('../modelos/usuario');
var Heroe = require('../modelos/heroe');

var fs = require('fs'); // File System sin ninugn npm install !!!
var middleware = require('../middlewares/autentificacion');
app.use(fileUpload()); // Middleware de archivos

// Donde Tipo es {Medicos, Hospitales, Usuarios} y id es el id de {U, H, M}.
app.put('/:tipo/:id', [middleware.verificaToken, middleware.verificaADMIN_o_USER], (req, res, next) => {

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: {
                messaje: 'Debe Seleccionar una imagen'
            }
        });
    }

    var archivo = req.files.imagen; // Archivo Subido 
    var nombreSplit = archivo.name.split('.'); // Nombre del Archivo
    var extensionArchivo = nombreSplit[nombreSplit.length - 1]; // Extension del Archivo

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: {
                messaje: ' Las extensiones validas son ' + extensionesValidas.join(', ')
            }
        });
    }

    // Id de los tipos de entidades, USuario, Heroe, Otro
    var id = req.params.id;
    var tipo = req.params.tipo
    var tiposValidos = ['usuarios', 'heroes']; // Heroes, Otros

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de Collection no valido',
            errors: {
                messaje: 'Tipos de Collection validos son ' + tiposValidos.join(', ')
            }
        });

    }
    // Mueve el archvio de Temporal a un PATH fijo
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`


    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover Archivo',
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);
    });


});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al buscar Usuario"
                });
            }
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario con el id ' + id + ' no existe',
                    errors: {
                        messaje: 'No existe un usuario con ese ID'
                    }

                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img; // Puede ser NULL ?
            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen de Usuario',
                        errors: err
                    });
                }

                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Usuario Actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    else if (tipo === 'heroes') {
        Heroe.findById(id, (err, heroe) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al buscar Heroe"
                });
            }
            if (!heroe) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El heroe con el id ' + id + ' no existe',
                    errors: {
                        messaje: 'No existe un Heroe con ese ID'
                    }

                });
            }

            var pathViejo = './uploads/heroes/' + heroe.img; // Puede ser NULL ?
            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            heroe.img = nombreArchivo;
            heroe.save((err, heroeActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen de Heroe',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Usuario Actualizada',
                    heroe: heroeActualizado
                });
            });
        });
    }


}
module.exports = app;