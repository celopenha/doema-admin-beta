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
var moment = require('moment');
let nivel;
let lista = [];
let username;
let imagem;
let finallista = {};
let json = {};
let teste;


module.exports = async function (app) {

    let dataAtual = new Date();
    dataAtual = moment(dataAtual).toDate();
    dataAtual = moment(dataAtual).format("DD/MM/YYYY");

    app.use(cookieParser());
    app.use(session({ secret: "2C44-4D44-WppQ38S" }));

    // Rota para exibição da View Listar
    app.get('/app/' + rota + '/list', function (req, res) {

        if (!req.session.token) {
            res.redirect('/app/login');
        } else {

            request({
                url: process.env.API_HOST + rota,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {

                function convertCase(str) {
                    str = S(str).replaceAll('_', ' ');
                    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
                }

                lista = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finallista = {
                        id: body.data[i].id,
                        caderno: convertCase(body.data[i].caderno),
                        data: body.data[i].data,
                        nome: body.data[i].nome,
                        pesquisa: convertCase(body.data[i].pesquisa)
                    };
                    lista.push(finallista);
                }
                res.format({
                    html: function () {
                        res.render(rota + '/List', {
                            itens: lista,
                            page: rota,
                            informacoes: req.session.json
                        });

                    }
                });
                return lista;
            });

        }
    });

    // Rota para exibição da View Criar
    app.get('/app/' + rota + '/create/', function (req, res) {
        res.format({
            html: function () {
                res.render(rota + '/Create', { page: rota, informacoes: req.session.json, dataAtual: dataAtual });
            }
        });

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
                "caderno": req.body.caderno,
                "cpf": req.body.cpf,
                "data": dataAtual,
                "email": req.body.email,
                "nome": req.body.nome,
                "pesquisa": req.body.pesquisa,
                "termo": req.body.termo
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível realizar o requerimento. " + body.errors);
            } else {
                req.flash("success", "Cadastro feito com sucesso.");
            }

            res.redirect('/app/' + rota + '/list');
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

                res.format({
                    html: function () {
                        res.render(rota + '/Edit', {
                            id: body.data.id,
                            caderno: body.data.caderno,
                            cpf: body.data.cpf,
                            data: body.data.data,
                            email: body.data.email,
                            nome: body.data.nome,
                            pesquisa: body.data.pesquisa,
                            termo: body.data.termo,
                            page: rota,
                            number: body.data.number,
                            informacoes: req.session.json
                        });
                    }
                });

            });
        }
    });

    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit/submit', upload.single('photo'), function (req, res) {

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
                "caderno": req.body.caderno,
                "cpf": req.body.cpf,
                "data": req.body.data,
                "email": req.body.email,
                "nome": req.body.nome,
                "pesquisa": req.body.pesquisa,
                "termo": req.body.termo
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                //req.flash("danger", "Não foi possível alterar o item. " + body.errors);
            } else {
                //req.flash("success", "Item alterado com sucesso.");
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
                    //req.flash("danger", "Item não excluído. " + body.errors);
                } else {
                    //req.flash("success", "Item excluído com sucesso.");
                }

                res.redirect('/app/' + rota + '/list');
                return true;
            });

        }
    });

}