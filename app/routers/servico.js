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
            }, function(error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Ops, ocorreu um erro.");
                    req.session.destroy();
                    res.redirect('/app/login');
                }
                lista = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {   
                        const finallista = {
                            id: body.data[i].id,
                            nome: body.data[i].nome,
                            imagem: body.data[i].imagem,
                            descricao: body.data[i].descricao,
                            status: body.data[i].status
                        };
                        lista.push(finallista);
                }
                if (req.session.json.NivelUser == 'ADMIN') {
                    res.format({
                        html: function() {
                            res.render(rota + '/List', {itens: lista, page: rota, informacoes: req.session.json, jsonescola: req.session.jsonescola });

                        }
                    });
                } else {
                    res.format({
                        html: function() {
                            res.render(rota + '/List-Responsavel', {itens: lista, page: rota, informacoes: req.session.json, jsonescola: req.session.jsonescola });

                        }
                    });
                }
                return lista;
            });
        }
    });

    // Rota para exibição da View Criar
    app.get('/app/' + rota + '/create/', function(req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');

        } else if(req.session.json.NivelUser == 'ADMIN') {
            res.format({
                html: function() {
                    res.render(rota + '/Create', {                                                  
                        page: rota,
                        informacoes: req.session.json, jsonescola: req.session.jsonescola
                    });
                }
            });
        }else{
            res.redirect('/app/sessao/calendar');
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/' + rota + '/create/submit', upload.single('photo'), function(req, res) {
       /* if (req.file.size > 220220) {
            req.flash("danger", "Item não salvo. Sua imagem deve ter até 200kb.");
            res.redirect('/app/' + rota + '/list');
        } else { */
            const file = req.file;
            let foto = "";
            if (file) {
                const buf = Buffer.from(req.file.buffer);
                foto = buf.toString('base64');
            }
            const camposadicionais = [];

            if (req.body.camposadicionais == 'true') {
                if (Array.isArray(req.body.camponome)) {
                    for (var i = 0; i < req.body.camponome.length; i++) {
                        const campo = {
                            "nome": req.body.camponome[i],
                            "obrigatorio": req.body.camposobrigatorio[i],
                            "tipoArquivo": req.body.campotipo[i]
                        }
                        camposadicionais.push(campo);
                    }
                } else {
                    const campo = {
                        "nome": req.body.camponome,
                        "obrigatorio": req.body.camposobrigatorio,
                        "tipoArquivo": req.body.campotipo
                    }
                    camposadicionais.push(campo);
                }
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
                    "nome": req.body.nome,
                    "imagem": foto,
                    "descricao": req.body.descricao,
                    "status": req.body.status,
                    "aniversario": req.body.aniversario,
                    "camposAdicionais": camposadicionais
                },
            }, function(error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Não foi possível cadastrar o serviço. " + body.errors);
                } else {
                    req.flash("success", "Serviço cadastrado com sucesso.");
                }

                res.redirect('/app/' + rota + '/list');
                return true;
            });
      //  }
    });

     // Rota para exibição da View Editar
     app.get('/app/' + rota + '/edit/:id', function(req, res) {
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
                            nome: body.data.nome,
                            imagem: body.data.imagem,
                            descricao: body.data.descricao,
                            status: body.data.status,
                            aniversario: body.data.aniversario,
                            camposAdicionais: body.data.camposAdicionais,
                            page: rota, informacoes: req.session.json, jsonescola: req.session.jsonescola
                        });
                    }
                });
               
            });
        }
    });

    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit/submit', upload.single('photo'), function(req, res) {  
     /*   if (req.file.size > 220220) {
            req.flash("danger", "Item não salvo. Sua imagem deve ter até 200kb.");
            res.redirect('/app/' + rota + '/list');
        } else { */
            const file = req.file;
            let foto = "";
            if (file) {
                const buf = Buffer.from(req.file.buffer);
                foto = buf.toString('base64');
            }
            const camposadicionais = [];
            if (req.body.camposadicionais == 'true') {
                if (Array.isArray(req.body.camponome)) {
                    for (var i = 0; i < req.body.camponome.length; i++) {
                        const campo = {
                            "id": req.body.campoid[i],
                            "nome": req.body.camponome[i],
                            "obrigatorio": req.body.camposobrigatorio[i],
                            "tipoArquivo": req.body.campotipo[i]
                        }
                        camposadicionais.push(campo);
                    }
                } else {
                    const campo = {
                        "id": req.body.campoid,
                        "nome": req.body.camponome,
                        "obrigatorio": req.body.camposobrigatorio,
                        "tipoArquivo": req.body.campotipo
                    }
                    camposadicionais.push(campo);
                }
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
                    "nome": req.body.nome,
                    "imagem": foto,
                    "descricao": req.body.descricao,
                    "status": req.body.status,
                    "aniversario": req.body.aniversario,
                    "camposAdicionais": camposadicionais
                },
            }, function(error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Não foi possível alterar o item. "+body.errors);
                } else {
                    req.flash("success", "Item alterado com sucesso.");
                }
                res.redirect('/app/' + rota + '/list');
                return true;
            });   
       // }   
    });

    // Rota para exclusão de um item
    app.post('/app/' + rota + '/delete/', function(req, res) {
        
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

                res.redirect('/app/' + rota + '/list');
                return true;
            });

        }
    });

};