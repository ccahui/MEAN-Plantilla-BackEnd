var express = require('express');
var app = express();
var Usuario = require('../modelos/usuario');


app.get('/usuarios/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var expresionReg = new RegExp(busqueda, 'i'); // Busqueda de coincidencia  

    buscarUsuarios(expresionReg).then(usuarios => {
        res.status(200).json({
            ok: true,
            usuarios
        })
    }).catch(err => {
        res.status(500).json({
            ok:false,
            mensaje:'Error al buscar Usuarios'
        });
    });
});



app.get('/todo/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var expresionReg = new RegExp(busqueda, 'i'); // Busqueda de coincidencia  

    // Un array de Promesas
    Promise.all([buscarUsuarios(expresionReg)]).then(respArray => {

        res.status(200).json({
            ok: true,
            usuarios: respArray[0]
        });

    }).catch(errArray=>{
        res.status(500).json({
            ok:false
        });
    })
    ;
});



function buscarUsuarios(regExp) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img')
            .or([{
                'nombre': regExp
            }, {
                'email': regExp
            }]).exec((err, usuarios) => {
                if (err) {
                    reject('Error al buscar Usuarios ', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}




module.exports = app;