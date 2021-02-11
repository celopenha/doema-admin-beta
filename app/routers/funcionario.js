require('dotenv').config();
const request = require('request');
const base64Img = require('base64-img');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
const fs = require('fs');
var multer = require('multer');
const escola = require('./escola');
var upload = multer();

let nivel;
let lista = [];
let username;
let imagem;
let finallista = {};
let json = {};
let teste;
//const Array = require('array');
//export const list2 = "teste";


module.exports = async function (app) {

    app.use(cookieParser());
    app.use(session({ secret: "2C44-4D44-WppQ38S" }));

    app.use(require('connect-flash')());
    app.use(function (req, res, next) {
        res.locals.messages = require('express-messages')(req, res);
        next();
    });

    // Rota para exibição da View Listar
    app.get('/app/' + rota + '/list/:id?', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            if (req.session.json.NivelUser == 'ADMIN') {
                req.session.IdEscola = req.params.id;
            } else {
                req.session.IdEscola = req.session.escola;
            }
            if (req.session.json.NivelUser == 'RESPONSAVEL'){
                res.redirect('/');
                return false
            }
            request({
                url: process.env.API_HOST + rota + "/escola/" + req.session.IdEscola,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Ops, ocorreu um erro.");
                    req.session.destroy();
                    res.redirect('/app/login');
                }
                lista = [];

                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    if (body.data[i].fone == null || body.data[i].fone == '') {
                        body.data[i].fone = body.data[i].celular
                    }
                        const finallista = {
                            id: body.data[i].id,
                            nome: body.data[i].nome,
                            cpf: body.data[i].cpf,
                            bairro: body.data[i].endereco.bairro,
                            celular: body.data[i].endereco.celular,
                            cep: body.data[i].endereco.cep,
                            fone: body.data[i].endereco.fone,
                            endereco_id: body.data[i].endereco.id,
                            logradouro: body.data[i].endereco.logradouro,
                            id_escola: body.data[i].escola.id
                        };
                        lista.push(finallista);

                }
                res.format({
                    html: function () {
                        res.render(rota + '/List', { itens: lista, page: rota, informacoes: req.session.json, number: body.data.number, totalPages: body.data.totalPages, jsonescola: req.session.jsonescola });

                    }
                });
                return lista;

            });

        }
    });

    // Rota para exibição da View Criar
    app.get('/app/' + rota + '/create', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            res.format({
                html: function () {
                    res.render(rota + '/Create', { page: rota, jsonescola: req.session.jsonescola, informacoes: req.session.json });
                }
            });
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/' + rota + '/create/submit', upload.single('photo'), function (req, res) {
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
                "cpf": req.body.cpf,
                "tipoEscola": req.body.tipoEscola,
                "endereco": {
                    "fone": req.body.fone,
                    "celular": req.body.celular,
                    "bairro": req.body.bairro,
                    "logradouro": req.body.logradouro,
                    "numero": req.body.numero,
                    "cep": req.body.cep
                },
                "escola": {
                    "id": req.session.escola
                },
            },
        }, function (error, response, body) {
            if (response.statusCode == 200) {
                req.flash("success", "Funcionário cadastrado com sucesso.");
            } else {
                req.flash("danger", "Não foi possível cadastrar o funcionário." + body.errors);
            }
            res.redirect('/app/' + rota + '/list/');
            return true;
        });

    });

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + "/" + req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Ops, ocorreu um erro.");
                    req.session.destroy();
                    res.redirect('/app/login');
                }
                var disable = '';
                if (req.session.json.NivelUser == 'ADMIN') {
                    disable = 'disabled';
                }

                res.format({
                    html: function () {
                        res.render(rota + '/Edit', {
                            id: body.data.id,
                            cpf: body.data.cpf,
                            nome: body.data.nome,
                            bairro: body.data.endereco.bairro,
                            logradouro: body.data.endereco.logradouro,
                            numero: body.data.endereco.numero,
                            cep: body.data.endereco.cep,
                            celular: body.data.endereco.celular,
                            fone: body.data.endereco.fone,
                            endereco_id: body.data.endereco.id,
                            id_escola: body.data.escola.id,
                            disable,
                            page: rota,
                            informacoes: req.session.json, jsonescola: req.session.jsonescola
                        });
                    }
                });

            });
        }
    });

    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit/submit', function (req, res) {
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
                "cpf": req.body.cpf,
                "endereco": {
                    "fone": req.body.fone,
                    "celular": req.body.celular,
                    "bairro": req.body.bairro,
                    "logradouro": req.body.logradouro,
                    "numero": req.body.numero,
                    "cep": req.body.cep,
                    "id": req.body.enderecoId
                },
                "escola": {
                    "id": req.session.escola
                },
            },
        }, function (error, response, body) {
            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível alterar o item. " + body.errors);
            } else {
                req.flash("success", "Item alterado com sucesso.");
            }
            res.redirect('/app/' + rota + '/list/');
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
                res.redirect('/app/' + rota + '/list/');
                return true;
            });

        }
    });

}