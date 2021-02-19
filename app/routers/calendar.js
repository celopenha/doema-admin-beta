require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();
let lista = [];
var S = require('string');
var moment = require('moment');



module.exports = async function (app) {

    app.use(cookieParser());
    app.use(session({
        secret: "2C44-4D44-WppQ38S"
    }));

    app.use(require('connect-flash')());
    app.use(function (req, res, next) {
        res.locals.messages = require('express-messages')(req, res);
        next();
    });

    // Rota para exibição da View Listar
    app.get('/app/feriados/' + rota, function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            var data = new Date();
            var mes = data.getMonth() + 1;
            mes = mes.toString();
            if (mes < 10) {
                mes = '0' + mes.toString();
            }
                request({
                    url: process.env.API_HOST + 'feriados/' + req.params.id,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json"
                    },
                }, function (error, response, body) {
                    lista = [];
                    for (var i = 0; i < Object.keys(body.data).length; i++) {

                        const finallista = {
                            id: body.data[i].id,
                            dia: body.data[i].dia,
                            titulo: body.data[i].titulo,
                            descricao: body.data[i].descricao,
                            feriados: body.data[i].feriados,
                        };
                        
                        if (req.session.json.NivelUser == 'ADMIN') {
                            lista.push(finallista);
                        }

                    }
                    dias = [];

                    for (var i = 0; i < lista.length; i++) {

                        const diaslista = {

                            id: lista[i].id,
                            title: lista[i].titulo,
                            start: lista[i].dia,
                            startModal: moment(lista[i].dia).format('DD/MM/YYYY HH:mm'),
                            endModal: moment(lista[i].dia).format("DD/MM/YYYY HH:mm"),
                            color: "blue",
                            title2: lista[i].titulo,

                        };
                        if (req.session.json.NivelUser == 'ADMIN') {
                            dias.push(diaslista);
                        }

                    };
                    if (!req.session.token) {
                        res.format({
                            html: function () {
                                res.render('feriados/Calendar-public', {itens: lista, eventos: dias, page: rota, informacoes: req.session.json});
                            }
                        });
                        return lista;
                    } else {
                        res.format({
                            html: function () {
                                res.render('feriados/Calendar', {itens: lista, eventos: dias, page: rota, informacoes: req.session.json});
                            }
                        });
                        return lista;
                    }
                });
            
            
        }



    });

    app.post('/app/servico/:id/calendar/mes/:mes', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            var mes = req.params.mes;
            mes = mes.toString();
            request({
                url: process.env.API_HOST + 'sessao/servico/' + req.params.id + '/mes/' + mes,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json"
                },
            }, function (error, response, body) {
                lista = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finallista = {
                        id: body.data[i].id,
                        horaFim: body.data[i].horaFim,
                        horaInicio: body.data[i].horaInicio,
                        cor: body.data[i].cor,
                        sessao: body.data[i].sessao,
                        vagasTotais: body.data[i].vagas,
                        servicoId: body.data[i].servicoId,
                        vagas: body.data[i].vagasRestantes,
                        status: body.data[i].status
                    };
                    if (body.data[i].status == true) {
                        lista.push(finallista);
                    } else if (req.session.json.NivelUser == 'ADMIN') {
                        lista.push(finallista);
                    }

                }
                sessoes = [];
                for (var i = 0; i < lista.length; i++) {
                    switch (lista[i].vagas) {
                        case 0:
                            cor = '#d34300';
                            break;
                        case lista[i].vagasTotais:
                            cor = 'green';
                            break;
                        default:
                            if (req.session.json.NivelUser != "ADMIN") {
                                cor = 'orange';
                            } else {
                                cor = 'green';
                            }
                            break;
                    }
                    const sessoeslista = {
                        id: lista[i].id,
                        title: 'h - ' + lista[i].vagas + 'v - ' + lista[i].sessao,
                        start: lista[i].horaInicio,
                        startModal: moment(lista[i].horaInicio).format('HH:mm'),
                        end: lista[i].horaFim,
                        endModal: moment(lista[i].horaFim).format("HH:mm"),
                        vagas: body.data[i].vagas,
                        vagasRestantes: lista[i].vagas,
                        servicoId: body.data[i].servico.id,
                        color: cor,
                        title2: lista[i].sessao,
                    }
                    if (lista[i].status == true) {
                        sessoes.push(sessoeslista);
                    } else if (req.session.json.NivelUser == 'ADMIN') {
                        sessoes.push(sessoeslista);
                    }
                };
                return res.json({
                    itens: lista,
                    eventos: sessoes
                });
            })
        }

    })
}