
const mongoose = require('mongoose');
const URI = 'mongodb://localhost/heroesDB';

mongoose.connect(URI,{ useNewUrlParser: true }) // Una nueva caracteristica de mngodb
    .then(db => console.log("Conexion Realizada \x1b[32m%s\x1b[0m",'start'))
    .catch(err => console.error(err));

module.exports.DATA_BASE = mongoose;
module.exports.SEED = 'esta-es-mi-clave';
// Google
module.exports.CLIENT_ID ='274424266167-6urlvebi95c6n9v4tsm11a62140a94ei.apps.googleusercontent.com';
module.exports.CLIENT_SECRET = 'Nk5OP6l4pDtvpWxvJcmxVHO1';
// ROLES
module.exports.ADMIN_ROLE = 'ADMIN_ROLE';