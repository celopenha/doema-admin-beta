require('dotenv').config();
const request = require('request');
const base64Img = require('base64-img');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
const fs = require('fs');
var multer = require('multer');
var upload = multer();
var moment = require('moment');

const TelegramBot = require(`node-telegram-bot-api`);
const TOKEN = '1655413008:AAEed01JS6zG4AIgowcM5HXzweajthVD3yA';

const telegramUrl = (message) => `https://api.telegram.org/bot${TOKEN}/sendMessage?text=${message}&chat_id=-543169616`;





const bot = new TelegramBot(TOKEN, { polling: true });

var logErrorEcho = function logErrorEcho(msg) {
    return function (err) {
        return console.log(msg, err);
    };
};

var logSuccessEcho = function (msg, match) {
    return function (data) {
        console.log('Success:', data);
    };
};

var enviarMsg = (msg, match) => {
    bot.sendMessage(msg.chat.id, match[1])
        .then(logSuccessEcho(msg, match))
        .catch(logErrorEcho('Error:'));

}

bot.onText(/\/echo (.*)/, enviarMsg);



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

    // Rota para exibição da View Listar
    app.get('/app/' + rota + '/list', function (req, res) {


        date = new Date();
        date = moment(date).toDate();
        data = moment(req.body.date).toDate();
        data = moment(data).format('DD/MM/YYYY HH:Mm')

        console.log(data);

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
            }, function (error, response, body) {
                lista = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finallista = {
                        id: body.data[i].id,
                        titulo: body.data[i].titulo,
                        dataExpiracao: moment(body.data[i].dataExpiracao).format('DD/MM/YYYY'),
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

    app.get('/app/' + rota + '/mostraMensagem', function (req, res) {


        date = new Date();
        date = moment(date).toDate();
        data = moment(req.body.date).toDate();
        data = moment(data).format('DD/MM/YYYY HH:Mm')

            request({
                url: process.env.API_HOST + rota,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                listaDois = [];
                const finallista = {};
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    finallistaDois = {
                        id: body.data[i].id,
                        titulo: body.data[i].titulo,
                        dataExpiracao: moment(body.data[i].dataExpiracao).format('DD/MM/YYYY'),
                        mensagem: body.data[i].mensagem
                    };
                }
                listaDois.push(finallistaDois);
                const tam = listaDois.length;
                res.format({
                    html: function () {
                        res.render('mensagem/MostraMensagem', {
                            itens: listaDois,
                            tamanho: tam,
                            page: rota,
                            informacoes: req.session.json
                        });

                    }
                });
                return listaDois;
            });
        
    });

    // Rota para exibição da View Criar
    app.get('/app/' + rota + '/create', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {

            if (req.session.json.NivelUser != 'ADMIN') {
                res.redirect('/');
                return false
            }

            res.format({
                html: function () {
                    res.render(rota + '/Create', { page: rota, informacoes: req.session.json });
                }
            });
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/' + rota + '/create/submit', upload.single('photo'), function (req, res) {




        const file = req.file;
        let foto = "";
        if (file) {
            const buf = Buffer.from(file.buffer);
            foto = buf.toString('base64');
        }

        request({
            url: process.env.API_HOST + rota,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "titulo": req.body.titulo,
                "dataExpiracao": req.body.dataExpiracao,
                "mensagem": foto
            },
        }, function (error, response, body) {

            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível criar usuário. " + body.errors);
            } else {
                req.flash("success", "Mensagem cadastrada com sucesso.");

                request
                    .get(
                        telegramUrl(req.body.titulo)

                    )
                    .on('response', function (response) {
                        console.log(response.statusCode) // 200
                        // console.log(response.headers['content-type']) // 'image/png'
                    });
                // .pipe(request.put('http://localhost:3001'));
            }

            res.redirect('/app/' + rota + '/list');
            return true;
        });
    });


    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/view/:id', function (req, res) {
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
            }, function (error, response, body) {
                res.format({
                    html: function () {
                        res.render(rota + '/View', {
                            id: body.data.id,
                            titulo: body.data.titulo,
                            mensagem: body.data.mensagem,
                            dataExpiracao: moment(body.data.dataExpiracao).format('DD/MM/YYYY'),
                            page: rota,
                            informacoes: req.session.json
                        });
                    }
                });

            });
        }
    });

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id', function (req, res) {
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
            }, function (error, response, body) {

                res.format({
                    html: function () {
                        res.render(rota + '/Edit', {
                            id: body.data.id,
                            titulo: body.data.titulo,
                            mensagem: body.data.mensagem,
                            dataExpiracao: body.data.dataExpiracao,
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

        const file = req.file;
        let foto = "";
        if (file) {
            const buf = Buffer.from(req.file.buffer);
            foto = buf.toString('base64');
        }

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
                "titulo": req.body.titulo,
                "mensagem": foto,
                "dataExpiracao": req.body.dataExpiracao
            },
        }, function (error, response, body) {

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

}