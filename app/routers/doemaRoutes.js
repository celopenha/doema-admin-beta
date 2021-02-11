const rota = require('path').basename(__filename, '.js');
const path = require('path');

module.exports = async (app) => {
    console.log(rota);

    app.get(`/app/${rota}/teste`, (req, res) => {
        res.json({
            message: `testando rota ${rota}`
        })
    });


    app.get(`/app/${rota}/usuarios/listar`, (req, res) => {
        res.render('doema/usuario/listar');
    });

    app.get(`/app/${rota}/upload-jornal`, (req, res) => {
        res.render('doema/upload');
    });  
}