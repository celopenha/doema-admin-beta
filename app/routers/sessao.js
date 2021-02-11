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

let nivel;
let lista = [];
let username;
let imagem;
let finallista = {};
let json = {};
let teste;


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


    // Rota para exibição da View Sessão
    app.get('/app/servico/:id/' + rota + '/list', function (req, res) {
        
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {

            if (req.session.json.NivelUser != 'ADMIN'){
                res.redirect('/');
                return false
            }

            request({
                url: process.env.API_HOST + rota + "/servico/" + req.params.id + "/nome/0/10",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function(error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Ops, ocorreu um erro.");
                    req.session.destroy();
                    res.redirect('/app/login');
                }
                lista = [];
                for (var i = 0; i < Object.keys(body.data.content).length; i++) {   
                        const finallista = {
                            id: body.data.content[i].id,
                            horaFim: moment(body.data.content[i].horaFim).format('HH:mm'),
                            horaInicio: moment(body.data.content[i].horaInicio).format('DD/MM/YYYY HH:mm'),
                            vagas: body.data.content[i].vagas,
                            vagasRestantes: body.data.content[i].vagasRestantes,
                            aniversario: body.data.content[i].aniversario,
                            sessao: body.data.content[i].sessao,
                            servico: body.data.content[i].servico.nome,
                            status: body.data.content[i].status
                        };
                        lista.push(finallista);
                }
                res.format({
                    html: function() {
                        res.render(rota + '/List', {itens: lista, page: rota, servico: req.params.id, informacoes: req.session.json, jsonescola: req.session.jsonescola, number: body.data.number, totalPages: body.data.totalPages, });

                    }
                });
                return lista;
            });
        }
    });

    app.post('/app/servico/:id/' + rota + '/list', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: encodeURI(process.env.API_HOST + rota + "/servico/" + req.params.id + "/nome/" + req.body.page + "/" + req.body.size + "?nome=" + req.body.busca),
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function(error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Ops, ocorreu um erro.");
                    req.session.destroy();
                    res.redirect('/app/login');
                }
                lista = [];
                for (var i = 0; i < Object.keys(body.data.content).length; i++) {   
                        const finallista = {
                            id: body.data.content[i].id,
                            horaFim: moment(body.data.content[i].horaFim).format('HH:mm'),
                            horaInicio: moment(body.data.content[i].horaInicio).format('DD/MM/YYYY HH:mm'),
                            vagasRestantes: body.data.content[i].vagasRestantes,
                            vagasResponsavel: body.data.vagasResponsavel,
                            aniversario: body.data.content[i].aniversario,
                            sessao: body.data.content[i].sessao,
                            servico: body.data.content[i].servico.nome,
                            servicoId: body.data.content[i].servico.id,
                            status: body.data.content[i].status,
                        };
                        lista.push(finallista);
                }
                return res.json({
                    itens: lista, 
                    page: rota, 
                    servico: req.params.id, 
                    informacoes: req.session.json, 
                    jsonescola: req.session.jsonescola, 
                    number: body.data.number, 
                    totalPages: body.data.totalPages,
                });
            });
        }
    });

    // Rota para exibição da View Criar
    app.get('/app/servico/:id/' + rota + '/create/:date?', function(req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');

        } else if(req.session.json.NivelUser == 'ADMIN') {
            request({
                url: process.env.API_HOST + "servico/" + req.params.id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function(error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Ops, ocorreu um erro.");
                    req.session.destroy();
                    res.redirect('/app/login');
                } else {
                    res.format({
                        html: function() {
                            var date;
                            if(req.params.date){
                                date = req.params.date.replace(' ', 'T');
                            }
                            now = new Date(); // Data de hoje
                            req.session.past = new Date(date);
                            
                            diff = (req.session.past.getTime() - now.getTime()); // Subtrai uma data pela outra
                            req.session.limiteHoje = Math.ceil(diff / (1000 * 60 * 60 * 24)); // Divide o total pelo total de milisegundos correspondentes a 1 dia. (1000 milisegundos = 1 segundo).
        
                            if (req.session.limiteHoje < 0) {
                                req.flash("danger", "Só é possível agendar sessão posterior a data atual.");
        
                                res.redirect('/app/servico/list');
                                return false;
                            }
                            res.render(rota + '/Create', {                            
                                horaFim: date,
                                horaInicio: date,                                                      
                                page: rota,
                                aniversario: body.data.aniversario,
                                servico: req.params.id,
                                informacoes: req.session.json,
                                jsonescola: req.session.jsonescola
                            });
                        }
                    });
                }
            });
            
        }else{
            res.redirect('/app/servico/' + req.params.id + '/sessao/calendar');
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/servico/:id/' + rota + '/create/submit', upload.single('photo'), function(req, res) {
            request({
                url: process.env.API_HOST + rota,
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
                json: {
                    "horaFim": req.body.horaFim,
                    "horaInicio": req.body.horaInicio, 
                    "sessao": req.body.sessao,
                    "vagas": req.body.vagas,
                    "vagasRestantes": req.body.vagas,
                    "aniversario": req.body.aniversario,
                    "vagasResponsavel": req.body.vagasResponsavel == undefined ? req.body.vagas : req.body.vagasResponsavel,
                    "diasAntes": req.body.diasAntes,
                    "status": req.body.status,
                    "servico": {
                        "id": req.params.id
                    }                        
                },
            }, function(error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Não foi possível cadastrar o evento. "+body.errors);
                } else {
                    req.flash("success", "Evento cadastrado com sucesso.");
                }

                res.redirect('/app/servico/' + req.params.id + '/' + rota + '/list');
                return true;
            });
        
    });

     // Rota para exibição da View Editar
     app.get('/app/servico/:idServico/' + rota + '/edit/:id', function(req, res) {
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
            }, function(error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Ops, ocorreu um erro.");
                    req.session.destroy();
                    res.redirect('/app/login');
                }
                res.format({
                    html: function() {
                        res.render(rota + '/Edit', {
                            id: body.data.id,
                            horaFim: body.data.horaFim,
                            horaInicio: body.data.horaInicio,
                            sessao: body.data.sessao,
                            vagas: body.data.vagas,
                            vagasResponsavel: body.data.vagasResponsavel,
                            diasAntes: body.data.diasAntes,
                            aniversario: body.data.servico.aniversario,
                            servico: req.params.idServico,
                            status: body.data.status,                  
                            page: rota, informacoes: req.session.json, jsonescola: req.session.jsonescola
                        });
                    }
                });
               
            });
        }
    });

    // Rota para receber parametros via post editar item
    app.post('/app/servico/:idServico/' + rota + '/edit/submit', function(req, res) {
        request({
            url: process.env.API_HOST + rota + "/" + req.body.id,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
        }, function(error, response, body) {
                
            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível alterar o item. "+body.errors);
                res.redirect('/app/' + rota + '/list');
                return false;
            }

            preenchidas = body.data.vagas - body.data.vagasRestantes;
            if(preenchidas > req.body.vagas) {
                req.flash("danger", "O total de vagas definidas é menor que a quantidade de vagas preenchidas.");
                res.redirect('/app/' + rota + '/list');
                return false;
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
                    "horaInicio": req.body.horaInicio,                                        
                    "horaFim": req.body.horaFim,
                    "sessao": req.body.sessao,
                    "vagas": req.body.vagas,
                    "vagasRestantes": req.body.vagas - preenchidas,
                    "vagasResponsavel": req.body.vagasResponsavel == undefined ? req.body.vagas : req.body.vagasResponsavel,
                    "diasAntes": req.body.diasAntes,
                    "aniversario": req.body.aniversario,
                    "status": req.body.status,
                    "servico": {
                        "id": req.params.idServico
                    }
                },
            }, function(error, response, body) {
                
                if (response.statusCode != 200) {
                    req.flash("danger", "Não foi possível alterar o item. "+body.errors);
                } else {
                    req.flash("success", "Item alterado com sucesso.");
                }
                res.redirect('/app/servico/' + req.params.idServico + '/' + rota + '/list');
                return true;
            });
           
        });        
    });

    // Rota para exclusão de um item
    app.post('/app/servico/:idServico/' + rota + '/delete/', function(req, res) {
        
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
            }, function(error, response, body) {
                
                if (response.statusCode != 200) {
                    req.flash("danger", "Item não excluído. "+body.errors);
                } else {
                    req.flash("success", "Item excluído com sucesso.");
                }

                res.redirect('/app/servico/' + req.params.idServico + '/' + rota + '/list');
                return true;
            });

        }
    });

};