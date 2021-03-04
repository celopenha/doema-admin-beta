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

    app.get('/app/esqueci-senha/', function (req, res) {
        res.format({
            html: function () {
                res.render('esqueci-senha');
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
                req.session.jsonescola = {
                    bloqEscola: false,
                    IdEscola: 0,
                    endereco: ''
                };
                request({
                    url: process.env.API_HOST + 'escola/usuario/' + body.usuario.id,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },

                }, function (error, response, corpo) {
                    if (body.usuario.niveis == 'ESCOLA' || body.usuario.niveis == 'RESPONSAVEL') {
                        req.session.bloqEscola = corpo.data.deferido;
                        req.session.IdEscola = corpo.data.id;
                        req.session.endereco = corpo.data.endereco;
                        req.session.escola = corpo.data.id;
                        req.session.jsonescola = {
                            bloqEscola: corpo.data.deferido,
                            IdEscola: corpo.data.id,
                            endereco: corpo.data.endereco
                        };
                        bloqEscola = corpo.data.deferido;
                        if (req.session.bloqEscola == false) {
                            erroEscola = true;
                            res.redirect('/app/servico/list');
                            req.session.destroy();
                            return false;
                        } else {
                            res.redirect('/app/servico/list');
                            return true;
                        }
                    }
                    res.redirect('/');
                    return true;
                });
            }
        });

    });





    // Rota para enviar nova senha
    app.post('/app/redefinir-senha/submit', function (req, res) {
        if (!req.session.token && typeof redefinir === "undefined") {
            res.redirect('/app/login');
        } else {
        
            if (req.body.novaSenha != req.body.passwordrepetido) {
                req.flash("danger", "Item não atualizado. Senhas não correspondem.");
                res.redirect('/');
                return false;
            }

            request({
                url: process.env.API_HOST + "usuario/primeiro-acesso/alterar-senha",
                method: "PUT",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                json: {
                    "username": req.body.cnpj,
                    "password": req.body.senhaAtual,
                    "newPassword": req.body.novaSenha,
                    "redefinir": false
                }
            },function (error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Item não atualizado. " + body.errors);
                    res.redirect("/");
                } else {
                    req.flash("success", "Item atualizado com sucesso.");
                    res.redirect('/app/login');
                    return true;
                }
            });
        }
    });



    app.get('/app/sair', function (req, res) {
        req.session.destroy();
        res.redirect('/app/login');
    });

    app.get('/app/verifica/', function (req, res) {
        res.format({
            html: function () {
                res.render('verifica');
            }
        });
    });


    app.post('/app/recuperarsenha', function (req, res) {
        var cnpj = req.body.cnpj;
        request({
            url: process.env.API_HOST + "usuario/recuperarsenha/" + cnpj,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Ocorreu um erro. " + body.errors);
                res.redirect('/');
            } else {
                req.flash("success", "Senha enviada para o email cadastrado. (" + body.data.email + ")");
                res.redirect('/');
                return true;
            }
        });
    });

}
