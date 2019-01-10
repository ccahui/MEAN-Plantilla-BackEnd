var moongose = require('mongoose');
var Schema = moongose.Schema;
var uniqueValidator = require('mongoose-unique-validator'); // npm install para mensaje de validacion de tipo UNique

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido' // Usando npm install el plugin
}
var usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El  nombre es necesario'] // Mensaje de Validacion []
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es necesaria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true,
        default: 'USER_ROLE',
        enum: rolesValidos // Roles Validos
    },
    google:{
        type: Boolean,
        required: true,
        default: false // Valor por defecto false
    }
}, {collection: 'usuarios'}); // Moongose trabaja similar a Laravel, por defecto crea un plural el modelo pero este es en Ingles, NOSOTROS especificamos el nombre de la collection

usuarioSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser UNICO'
});

module.exports = moongose.model('Usuario', usuarioSchema);