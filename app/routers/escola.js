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
const validarCpf = require('validar-cpf');

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
    //Converte a primeira letra em Maíscula e as seguintes em Minúsculas
    function convertCase(str) {
        return str.replace(/(\w)(\S*)/g, function (x) {
            return x.charAt(0).toUpperCase() + x.substr(1).toLowerCase();
        });
    };
    function convertCase2(str) {
        str = str[0];
        return str.replace(/(\w)(\S*)/g, function (x) {
            return x.charAt(0).toUpperCase() + x.substr(1).toLowerCase();
        });
    };

    // Rota para exibição da View Listar
    app.get('/app/' + rota + '/list', function (req, res) {

        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            if (req.session.json.NivelUser != 'ADMIN') {
                res.redirect('/');
                return false
            }

            request({
                url: process.env.API_HOST + rota + "/nome/0/10",
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
                for (var i = 0; i < Object.keys(body.data.content).length; i++) {
                    if (body.data.content[i].endereco.fone == null || body.data.content[i].endereco.fone == '') {
                        body.data.content[i].endereco.fone = body.data.content[i].endereco.celular
                    }
                    const finallista = {
                        id: body.data.content[i].id,
                        cnpj: body.data.content[i].cnpj,
                        email: body.data.content[i].email,
                        fone: body.data.content[i].endereco.fone,
                        celular: body.data.content[i].endereco.celular, 
                        nome: convertCase(body.data.content[i].nome),
                        niveis: body.data.content[i].usuario.niveis,
                        niveisCase: convertCase2(body.data.content[i].usuario.niveis),
                        deferido: body.data.content[i].deferido
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

    app.post('/app/' + rota + '/list', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else if (req.session.usuario.niveis[0] != 'ADMIN') {
            res.redirect('/');
        } else { // " + req.body.size + "
            request({
                url: encodeURI(process.env.API_HOST + rota + "/nome/" + req.body.page + "/" + req.body.size + "?nome=" + req.body.busca),
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
                for (var i = 0; i < Object.keys(body.data.content).length; i++) {
                    if (body.data.content[i].fone == null || body.data.content[i].fone == '') {
                        body.data.content[i].fone = body.data.content[i].celular
                    }
                    const finallista = {
                        id: body.data.content[i].id,
                        cnpj: body.data.content[i].cnpj,
                        email: body.data.content[i].email,
                        celular: body.data.content[i].endereco.celular,
                        fone: body.data.content[i].endereco.fone,
                        nome: convertCase(body.data.content[i].nome),
                        niveis: body.data.content[i].usuario.niveis,
                        niveisCase: convertCase2(body.data.content[i].usuario.niveis),
                        deferido: body.data.content[i].deferido,
                        sexoResponsavel: body.data.content[i].sexoResponsavel
                    };
                    lista.push(finallista);
                }

                return res.json({
                    itens: lista,
                    page: rota,
                    informacoes: req.session.json,
                    number: body.data.number,
                    totalPages: body.data.totalPages, jsonescola: req.session.jsonescola
                });

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
                    res.render(rota + '/Create-Responsavel', { page: rota, informacoes: req.session.json, jsonescola: req.session.jsonescola });
                }
            });
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/' + rota + '/create/submit', upload.single('photo'), function (req, res) {

        let cpfTratado = S(req.body.cnpj).replaceAll('.', '').s;
        cpfTratado = S(cpfTratado).replaceAll('-', '').s;
        req.body.cnpj = S(cpfTratado).replaceAll('/', '').s;
        respCpf = validarCpf(req.body.cnpj);

        if (!respCpf) {
            req.flash("danger", "Não foi possível cadastrar. CPF invalido.");
            res.redirect('/');
            return false;
        }

        if (req.body.password != req.body.passwordrepetido) {
            req.flash("danger", "Não foi possível cadastrar. Senhas não correspondem.");
            res.redirect('/');
            return false;
        }
        
        if (req.body.email != req.body.emailrepetido) {
            req.flash("danger", "Não foi possível cadastrar. Emails não correspondem.");
            res.redirect('/');
            return false;
        }

        json = {
            "nome": req.body.nome,
            "cnpj": cpfTratado,
            "endereco": {
                "fone": req.body.fone,
                "celular": req.body.celular,
                "bairro": req.body.bairro,
                "logradouro": req.body.logradouro,
                "numero": req.body.numero,
                "cep": req.body.cep
            },
            "email": req.body.email,
            "gestor": req.body.gestor,
            "tipoEscolaResponsavel": req.body.tipoEscolaResponsavel,
            "deferido": true,
            "usuario": {
                "nome": req.body.nome,
                "username": cpfTratado,
                "password": req.body.password,
                "contato1": req.body.fone,
                "contato2": req.body.celular,
                "email": req.body.email,
                "niveis": [req.body.niveis],
                "ativo": true,
                "bloqueado": false,
                "expirado": false,
                "habilitado": true
            },
            "sexoResponsavel": req.body.sexoResponsavel
        };

        if (!req.session.token) {
            json.usuario.redefinir = false
        } else {
            json.usuario.redefinir = true
        }

        request({
            url: process.env.API_HOST + rota,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: json

        }, function (error, response, body) {
            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível cadastrar. " + body.errors);
                res.redirect('/');
                return true;
            } else {
                if (req.session.json != undefined) {
                    if (req.session.json.NivelUser == 'ADMIN') {
                        req.flash("success", "Usuário cadastrado.");
                        res.redirect('/app/escola/list');
                        return false;
                    }
                }
                req.flash("success", "Usuário cadastrado.");
                res.redirect('/');
            }
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
                    req.flash("danger", "Ops, ocorreu um erro. Tente novamente mais tarde." );
                    req.session.destroy();
                    res.redirect('/app/login');
                }
                res.format({
                    html: function () {
                        res.render(rota + '/Edit', {
                            id: body.data.id,
                            cnpj: body.data.cnpj,
                            email: body.data.email,
                            gestor: body.data.gestor,
                            nome: body.data.nome,
                            tipoEscolaResponsavel: body.data.tipoEscolaResponsavel,
                            sexoResponsavel: body.data.sexoResponsavel,
                            page: rota,
                            endereco_bairro: body.data.endereco.bairro,
                            endereco_logradouro: body.data.endereco.logradouro,
                            endereco_numero: body.data.endereco.numero,
                            endereco_cep: body.data.endereco.cep,
                            endereco_celular: body.data.endereco.celular,
                            endereco_fone: body.data.endereco.fone,
                            endereco_id: body.data.endereco.id,
                            usuario_password: body.data.usuario.password,
                            usuario_username: body.data.usuario.username,
                            usuario_id: body.data.usuario.id,
                            usuario_nome: body.data.usuario.nome,
                            usuario_niveis: body.data.usuario.niveis,
                            deferido: body.data.deferido,
                            motivo: body.data.motivo, informacoes: req.session.json, jsonescola: req.session.jsonescola
                        });
                    }
                });
               

                req.session.nivel = body.data.niveis;
                req.session.username = body.data.username;
                req.session.imagem = body.data.imgCapa;
            });
        }
    });

    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit/submit', upload.single('photo'), function (req, res) {

        let cpfTratado = S(req.body.cnpj).replaceAll('.', '').s;
        cpfTratado = S(cpfTratado).replaceAll('-', '').s;
        req.body.cnpj = S(cpfTratado).replaceAll('/', '').s;

        request({
            url: process.env.API_HOST + rota + "/validacao",
            method: "PUT",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "id": req.body.id,
                "nome": req.body.nome,
                "cnpj": req.body.cnpj,
                "endereco": {
                    "id": req.body.endereco_id,
                    "fone": req.body.endereco_fone,
                    "celular": req.body.endereco_celular,
                    "bairro": req.body.endereco_bairro,
                    "logradouro": req.body.endereco_logradouro,
                    "numero": req.body.numero,
                    "cep": req.body.endereco_cep
                },
                "email": req.body.email,
                "gestor": req.body.gestor,
                "tipoEscolaResponsavel": req.body.tipoEscolaResponsavel,
                "deferido": req.body.deferido,
                "motivo": req.body.motivo,
                "usuario": {
                    "id": req.body.usuario_id,
                    "nome": req.body.usuario_nome,
                    "username": req.body.usuario_username,
                    "password": req.body.usuario_password,
                    "contato1": req.body.endereco_fone,
                    "contato2": req.body.endereco_celular,
                    "email": req.body.email,
                    "niveis": [req.body.niveis],
                    "ativo": true,
                    "bloqueado": false,
                    "expirado": false,
                    "habilitado": true
                },
                "sexoResponsavel": req.body.sexoResponsavel
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


    // Rota para exibição da View Perfil
    app.get('/app/' + rota + '/perfil', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');

        } else {
            request({
                url: process.env.API_HOST + rota + "/" + req.session.IdEscola,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Ops, ocorreu um erro. Tente novamente mais tarde." );
                    req.session.destroy();
                    res.redirect('/app/login');
                }
                res.format({
                    html: function () {
                        res.render(rota + '/Perfil', {
                            id: body.data.id,
                            cnpj: body.data.cnpj,
                            email: body.data.email,
                            gestor: body.data.gestor,
                            nome: body.data.nome,
                            tipoEscolaResponsavel: body.data.tipoEscolaResponsavel,
                            sexoResponsavel: body.data.sexoResponsavel,
                            page: rota,
                            endereco_bairro: body.data.endereco.bairro,
                            endereco_logradouro: body.data.endereco.logradouro,
                            endereco_numero: body.data.endereco.numero,
                            endereco_cep: body.data.endereco.cep,
                            endereco_celular: body.data.endereco.celular,
                            endereco_fone: body.data.endereco.fone,
                            endereco_id: body.data.endereco.id,

                            usuario_password: body.data.usuario.password,
                            //usuario_username: body.data.usuario.username,
                            usuario_id: body.data.usuario.id,
                            //usuario_nome: body.data.usuario.nome, 

                            deferido: body.data.deferido,
                            informacoes: req.session.json,
                            jsonescola: req.session.jsonescola

                        });
                    }
                });
                req.session.nivel = body.data.niveis;
                req.session.username = body.data.username;
                req.session.imagem = body.data.imgCapa;
            });
        }
    });

    // Rota para enviar dados do perfil
    app.post('/app/' + rota + '/perfil/submit', upload.single('photo'), function (req, res) {

        let cpfTratado = S(req.body.cnpj).replaceAll('.', '').s;
        cpfTratado = S(cpfTratado).replaceAll('-', '').s;
        req.body.cnpj = S(cpfTratado).replaceAll('/', '').s;

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
                "cnpj": req.body.cnpj,
                "endereco": {
                    "id": req.body.endereco_id,
                    "fone": req.body.endereco_fone,
                    "celular": req.body.endereco_celular,
                    "bairro": req.body.endereco_bairro,
                    "logradouro": req.body.endereco_logradouro,
                    "numero": req.body.numero,
                    "cep": req.body.endereco_cep
                },
                "email": req.body.email,
                "gestor": req.body.gestor,
                "tipoEscolaResponsavel": req.body.tipoEscolaResponsavel,
                "deferido": req.body.deferido,
                "usuario": {
                    "id": req.body.usuario_id,
                    "nome": req.body.nome,
                    "username": req.body.cnpj,
                    "password": req.body.usuario_password,
                    "contato1": req.body.endereco_fone,
                    "contato2": req.body.endereco_celular,
                    "email": req.body.email,
                    "niveis": req.session.json.NivelUser,
                    "ativo": true,
                    "bloqueado": false,
                    "expirado": false,
                    "habilitado": true
                },
                "sexoResponsavel": req.body.sexoResponsavel
            },
        }, function (error, response, body) {
            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível alterar o item. " + body.errors);
            } else {
                req.flash("success", "Item alterado com sucesso.");
                req.session.json.NomeUser = body.data.usuario.nome;

            }

            res.redirect('/');
            return true;
        });

    });

}