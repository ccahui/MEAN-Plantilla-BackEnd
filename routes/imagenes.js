var express = require('express');
var fs = require('fs');
var app = express();
var pathA = require('path');
// Donde Tipo puede se { Usuarios, Medicos, Hospitales }
app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var path = `./uploads/${tipo}/${img}`;
    fs.exists(path, existe => {
        if (!existe) {
            path = './assets/no-image1.jpg';
        }
       // res.sendfile(pathA.join(__dirname, '/../uploads/'+tipo+'/'+img));
       // Es muy raro pero es la unica solucion que encontre para la solucion del warning DEPRECATION
       // Anteriormente era mas simple res.sendfile(path); 
       res.sendFile(pathA.join(__dirname+'/.'+path));
    });

});

module.exports = app;