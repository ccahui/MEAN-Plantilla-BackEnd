var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var heroeSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    superPoder: {
        type: String,
        required: false
    },
    descripcion: {
        type: String,
        required: false
    },
    img: {
        type: String,
        required: false
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
}, {
    collection: 'heroes'
}); // Moongose trabaja similar a Laravel, por defecto crea un plural el modelo pero este es en Ingles, NOSOTROS especificamos el nombre de la collection

module.exports = mongoose.model('Heroe', heroeSchema);