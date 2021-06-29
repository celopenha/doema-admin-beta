require('dotenv').config();
const request = require('request');
const base64Img = require('base64-img');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
const fs = require('fs');
var multer = require('multer');
var upload = multer();
var S = require('string');
let nivel;
let lista = [];
let username;
let imagem;
let finallista = {};
let json = {};
let teste;
//const Array = require('array');
//export const list2 = "teste";



module.exports = async function(app) {

    app.use(cookieParser());
    app.use(session({ secret: "2C44-4D44-WppQ38S" }));

    // Rota para exibição da View Listar
    app.get('/app/' + rota + '/list', function(req, res) {

        if (!req.session.token) {
            res.redirect('/app/login');
        } else {

            if (req.session.json.NivelUser != 'ADMIN') {
                res.redirect('/');
                return false
            }

            request({
                url: process.env.API_HOST + rota,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function(error, response, body) {
                function convertCase(str) {
                    str = S(str).replaceAll('_', ' de ');
                    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
                }
                lista = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finallista = {
                        id: body.data[i].id,
                        nome: body.data[i].nome,
                        username: body.data[i].username,
                        niveis: convertCase(body.data[i].niveis),
                        ativo: body.data[i].ativo,
                        telefone: body.data[i].telefone,
                        email: body.data[i].email
                    };
                    lista.push(finallista);
                }
                res.format({
                    html: function() {
                        res.render(rota + '/List', { 
                            itens: lista,
                            page: rota,
                            informacoes: req.session.json,
                            number: body.data.number,
                            totalPages: body.data.totalPages,
                        });

                    }
                });
                return lista;
            });

        }
    });

    // Rota para exibição da View Criar
    app.get('/app/' + rota + '/create', function(req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            if (req.session.json.NivelUser != 'ADMIN') {
                res.redirect('/');
                return false
            }
            res.format({
                html: function() {
                    res.render(rota + '/Create', { page: rota, informacoes: req.session.json });
                }
            });
        }
    });

    app.post('/app/' + rota + '/create/submit', upload.single('photo'), function(req, res) {
        console.log(process.env.API_HOST + rota)
            request({
                url: process.env.API_HOST + rota,
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
                json: {
                    "nome": req.body.nome,
                    "username": req.body.username,
                    "password": req.body.password,
                    "niveis": [req.body.niveis],
                    "ativo": req.body.ativo,
                    "habilitado": true,
                    "expirado": false,
                    "bloqueado": false,
                    "telefone": req.body.telefone,
                    "email": req.body.email
                },
            }, function(error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Não foi possível criar usuário. " + body.errors);
                } else {
                    req.flash("success", "Usuário criado com sucesso.");
                }

                res.redirect('/app/' + rota + '/list');
                return true;
            });
        });
    

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id', function(req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');

        } else {

            if (req.session.json.NivelUser != 'ADMIN') {
                res.redirect('/');
                return false
            }
            
            request({
                url: process.env.API_HOST + rota + "/" + req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function(error, response, body) {

                res.format({
                    html: function() {
                        res.render(rota + '/Edit', {
                            id: body.data.id,
                            nome: body.data.nome,
                            username: body.data.username,
                            password: body.data.password,
                            page: rota,
                            ativo: body.data.ativo,
                            nivel: body.data.niveis,
                            telefone: body.data.telefone,
                            email: body.data.email,
                            number: body.data.number,
                            informacoes: req.session.json
                        });
                    }
                });
                nivel = body.data.niveis;
                username = body.data.username;
                imagem = body.data.imgCapa;
            });
        }
    });

    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit/submit', upload.single('photo'), function(req, res) {  
        
            request({
                url: process.env.API_HOST + rota,
                method: "PUT",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
                json: {
                    "id": req.body.id,
                    "nome": req.body.nome,
                    "username": username,
                    "niveis": [req.body.niveis],
                    "telefone": req.body.telefone,
                    "email": req.body.email,
                    "ativo": req.body.ativo,
                },
            }, function(error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Não foi possível alterar o item. " + body.errors);
                } else {
                    req.flash("success", "Item alterado com sucesso.");
                }

                res.redirect('/app/' + rota + '/list');
                return true;
            });
        
    });

    // Rota para exclusão de um item
    app.post('/app/' + rota + '/delete/', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + "/" + req.body.id,
                method: "DELETE",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Item não excluído. " + body.errors);
                } else {
                    req.flash("success", "Item excluído com sucesso.");
                }

                res.redirect('/app/' + rota + '/list');
                return true;
            });

        }
    });

    
    // Rota para exibição da View Perfil
    app.get('/app/' + rota + '/perfil', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');

        } else {
            request({
                url: process.env.API_HOST + rota + "/" + req.session.json.IdUser,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {

                function convertCase(str) {
                    str = S(str).replaceAll('_', ' de ');
                    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
                }

                res.format({
                    html: function () {
                        res.render(rota + '/Perfil', {
                            id: body.data.id,
                            nome: body.data.nome,
                            username: body.data.username,
                            nivel: body.data.niveis,
                            password: body.data.password,
                            page: rota,
                            ativo: body.data.ativo,
                            habilitado: body.data.habilitado,
                            expirado: body.data.expirado,
                            bloqueado: body.data.bloqueado,
                            telefone: body.data.telefone,
                            email: body.data.email,
                            informacoes: req.session.json,
                        });
                    }
                });
                nivel = body.data.niveis;
                username = body.data.username;
                imagem = body.data.imgCapa;
            });
        }
    });

    // Rota para receber parametros via post editar perfil
    app.post('/app/' + rota + '/perfil/submit', upload.single('photo'), function (req, res) {


        request({
            url: process.env.API_HOST + rota,
            method: "PUT",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "id": req.body.id,
                "nome": req.body.nome,
                "username": username,
                "niveis": [req.body.niveis],
                "telefone": req.body.telefone,
                "email": req.body.email,
                /*
                "ativo": req.body.ativo,
                "habilitado": req.body.habilitado,
                "expirado": req.body.expirado,
                "bloqueado": req.body.bloqueado
                */
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível alterar o item. " + body.errors);
            } else {
                req.flash("success", "Item alterado com sucesso.");
                req.session.json.NomeUser = body.data.nome;
            }

            res.redirect('/app/usuario/list');
            return true;
        });

    });

     // Rota para exibição da View Alterar Senha
     app.get('/app/' + rota + '/alterar-senha', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            res.format({
                html: function () {
                    res.render(rota + '/Alterar-Senha', {
                        page: rota,
                        informacoes: req.session.json
                    });
                }
            });
        }
    })

    // Rota para enviar nova senha
    app.post('/app/' + rota + '/alterar-senha/submit', upload.single('photo'), function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            if (req.body.novaSenha != req.body.passwordrepetido) {
                req.flash("danger", "Item não atualizado. Senhas não correspondem.");
                res.redirect('/');
                return false;
            }
            
            request({
                url: process.env.API_HOST + rota + "/alterar-senha",
                method: "PUT",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                json: {
                    "id": req.body.id,
                    "password": req.body.senhaAtual,
                    "newPassword": req.body.novaSenha
                }
            }, function (error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Item não atualizado. " + body.errors);
                    res.redirect("/");
                } else {
                    req.flash("success", "Item atualizado com sucesso.");
                    res.redirect('/app/' + rota + '/alterar-senha/');
                    return true;
                }
            });
        }
    })

}