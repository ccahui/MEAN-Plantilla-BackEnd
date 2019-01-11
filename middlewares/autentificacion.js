var jwt = require('jsonwebtoken'); // npm install token
var SEED = require('../configuraciones/config').SEED; // Esta es mi clave para el TOKEN
//ROLE
const ADMIN_ROLE = require('../configuraciones/config').ADMIN_ROLE;

// ==============================
// Verificar TOKEN
// ==============================
exports.verificaToken = function (req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({ // No autorizado
                ok: false,
                mensaje: 'Token Incorrecto',
                errors: err
            });
        }
        req.usuario = decoded.usuario; // El usuario Actual de Sesion para utilizarlo en hospital y medico
        next();

    });
}
// Verifica ADMIN
exports.verificaADMIN = function (req, res, next) {
    // Usuario Login
    var usuario = req.usuario;

    if (usuario.role === ADMIN_ROLE) {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Usuario no Autorizado',
            errors: {
                messaje: 'No es administrador, no tiene los permisos'
            }
        });
    }
}
// Para realizar operaciones de MODIFICAR PERFIL /usuarios:id
exports.verificaADMIN_o_USER = function (req, res, next) {
    // Usuario Login
    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === ADMIN_ROLE || usuario._id === id ) {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Usuario no Autorizado',
            errors: {
                message: 'No administrador - Ni mismo Usuario'
            }
        });
    }
}
