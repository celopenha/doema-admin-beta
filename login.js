require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');

module.exports = async function (app) {
    app.use(cookieParser());
    app.use(session({ secret: "2C44-4D44-WppQ38S" }));

    app.use(require('connect-flash')());
    app.use(function (req, res, next) {
        res.locals.messages = require('express-messages')(req, res);
        next();
    });

    app.get('/app/login/', function (req, res) {
        res.format({
            html: function () {
                res.render('login');
            }
        });
    });

    app.post('/app/authentication/', function (req, res) {
        DadosUser = request({
            url: process.env.API_HOST_LOGIN,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json"
            },
            json: {
                "username": req.body.email,
                "password": req.body.password,
            },
        }, function (error, response, body) {
            if (response.statusCode != 201) {
                req.flash("danger", body.errors);
                res.redirect('/');
                return false;
            } else {
                redefinir = body.usuario.redefinir;
                if (redefinir) {
                    res.render('redefinir-senha', { cnpj : req.body.email, password : req.body.password});
                    return false;
                }
                req.session.token = body.accessToken;
                req.session.usuario = body.usuario;
                req.session.json = {
                    IdUser: body.usuario.id,
                    NomeUser: body.usuario.nome,
                    NivelUser: body.usuario.niveis,
                    EmailUser: body.usuario.email
                };
                res.redirect('/');

            }
        });

    });

    app.get('/app/sair', function (req, res) {
        req.session.destroy();
        res.redirect('/app/login');
    });




}
