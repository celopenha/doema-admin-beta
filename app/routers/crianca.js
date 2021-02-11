require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();
let lista = [];
let responsavel;
var S = require('string');
var moment = require('moment');
const { Console } = require('console');

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
    app.get('/app/' + rota + '/list/:id', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            if (req.session.json.NivelUser == 'ADMIN') {
                req.session.IdEscola = req.params.id;
                nomeResponsavel =  '';
            } else {
                req.session.IdEscola = req.session.escola;
                nomeResponsavel =  '';
            }
            request({
                url: process.env.API_HOST + "escola/" + req.session.IdEscola,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, corpo) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Ops, ocorreu um erro.");
                    req.session.destroy();
                    res.redirect('/app/login');
                } else {
                    nomeResponsavel = corpo.data.nome;
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
                        function convertCase(str) {
                            str = S(str).replaceAll('_', '-');
                            return ((str.replace(/O$/m, "O(A)")).replace('IRMAO(A)', 'IRMÃO(Ã)')).replace(/(\w)(\S*)/g, function (x) {
                                return x.charAt(0).toUpperCase() + x.substr(1).toLowerCase();
                            });
                        };
                        if (body.data != null) {
                            for (var i = 0; i < Object.keys(body.data).length; i++) {
                                body.data[i].serie.series = S(body.data[i].serie.series).replaceAll('_', ' ').s;
                                if (body.data[i].endereco.fone == null || body.data[i].endereco.fone == '') {
                                    body.data[i].endereco.fone = body.data[i].endereco.celular
                                }
                                const finallista = {
                                    id: body.data[i].id,
                                    nome: convertCase(body.data[i].nome),
                                    serie_nome: convertCase(body.data[i].serie.series),
                                    nome_responsavel: body.data[i].responsavel == null ? body.data[i].escola.nome : convertCase(body.data[i].responsavel.nome),
                                    fone: body.data[i].endereco.fone,
                                    tipoResponsavel: convertCase(body.data[i].tipoResponsavel)
                                };
                                lista.push(finallista);
                            }
                        }
                        res.format({
                            html: function () {
                                res.render(rota + '/List', { itens: lista, idResponsavel : req.session.IdEscola, nomeResponsavel: corpo.data.nome, page: rota, informacoes: req.session.json, jsonescola: req.session.jsonescola});
                            }
                        });
                        return lista;
                    });
                }
            });
            
        }
    });

    // Rota para exibição da View Criar

    app.get('/app/' + rota + '/create', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else if (req.session.json.NivelUser == 'RESPONSAVEL' || req.session.json.NivelUser == 'ADMIN') {
            request({
                url: process.env.API_HOST + 'escola/' + req.session.IdEscola,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            },
                function (error, response, body) {
                    if (response.statusCode != 200) {
                        req.flash("danger", "Ops, ocorreu um erro.");
                        req.session.destroy();
                        res.redirect('/app/login');
                    }
                    lista = [];
                    const finallista = {
                        id: body.data.id,
                        nome: body.data.nome,
                        cpf: body.data.cnpj,
                        bairro: body.data.endereco.bairro,
                        celular: body.data.endereco.celular,
                        cep: body.data.endereco.cep,
                        fone: body.data.endereco.fone,
                        endereco_id: body.data.endereco.id,
                        logradouro: body.data.endereco.logradouro,
                        numero: body.data.endereco.numero
                    };
                    lista.push(finallista);
                    res.format({
                        html: function () {
                            res.render(rota + '/Create', { itens: lista, page: rota, informacoes: req.session.json, escola: body.data.id, jsonescola: req.session.jsonescola});
                        }
                    });
                    return lista;
                });

        } else {
            if (req.session.json.NivelUser == "ESCOLA") {
            request({
                url: process.env.API_HOST + 'responsavel/escola/' + req.session.escola,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            },
                function (error, response, body) {
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
                            cpf: body.data[i].cpf,
                            bairro: body.data[i].endereco.bairro,
                            celular: body.data[i].endereco.celular,
                            cep: body.data[i].endereco.cep,
                            fone: body.data[i].endereco.fone,
                            endereco_id: body.data[i].endereco.id,
                            logradouro: body.data[i].endereco.logradouro

                        };
                        lista.push(finallista);
                    }
                    res.format({
                        html: function () {
                            res.render(rota + '/Create', { itens: lista, page: rota, nivel: req.session.json.NivelUser, escola: req.session.escola, informacoes: req.session.json, jsonescola: req.session.jsonescola});

                        }
                    });
                    return lista;
                });
            } else {
                res.format({
                    html: function () {
                        res.render(rota + '/Create', {page: rota, nivel: req.session.json.NivelUser, endereco: req.session.endereco, informacoes: req.session.json, jsonescola: req.session.jsonescola});
            }
        });
        }
        }
    });


    // Rota para receber parametros via post criar item

    app.post('/app/' + rota + '/create/submit', upload.single('photo'), function (req, res) {

        nascimento = req.body.nascimento;
        var age = Math.floor(moment(new Date()).diff(moment(nascimento),'years',true));
        if (age > 12) {
            req.flash("danger", "A idade  da criança ultrapassa o limite de 12 anos.");
            res.redirect('/app/' + rota + '/list/' + req.session.IdEscola);
            return true;
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
                "endereco": {
                    "bairro": req.body.bairro,
                    "celular": req.body.celular,
                    "cep": req.body.cep,
                    "fone": req.body.fone,
                    "logradouro": req.body.logradouro,
                    "numero": req.body.numero
                },
                "escola": {
                    "id": req.session.IdEscola,
                },
                "nascimento": req.body.nascimento,
                "nome": req.body.nome,
                "tipoDeficiencia": req.body.tipoDeficiencia,
                "alergico": req.body.alergico,
                "tipoAlergia": req.body.tipoAlergia,
                "observacoes": req.body.observacoes,
                "observacao": req.body.observacao,
                "serie": {
                    "series": req.body.serie_nome
                },
                "tipoResponsavel": req.body.tipoResponsavel
            },
        }, function (error, response, body) {
            
            if (response.statusCode != 200) {
                req.flash("danger", "Item não salvo. " + body.errors);
            } else {
                req.flash("success", "Item salvo com sucesso.");
            }

            res.redirect('/app/' + rota + '/list/' + req.session.IdEscola);
            return true;
        });
    });

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else if (req.session.json.NivelUser != 'ESCOLA') {
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
                var dated = moment(body.data.nascimento).format("YYYY-MM-DD");
                res.format({
                    html: function () {
                        if(req.session.IdEscola == body.data.escola.id || req.session.json.NivelUser == 'ADMIN'){
                            res.render(rota + '/Edit', {
                                id: body.data.id,
                                nome: body.data.nome,
                                series: body.data.serie.series,
                                serie_id: body.data.serie.id,
                                nascimento: dated,
                                tipoDeficiencia: body.data.tipoDeficiencia,
                                alergico: body.data.alergico,
                                tipoAlergia: body.data.tipoAlergia,
                                bairro: body.data.endereco.bairro,
                                logradouro: body.data.endereco.logradouro,
                                numero: body.data.endereco.numero,
                                cep: body.data.endereco.cep,
                                celular: body.data.endereco.celular,
                                fone: body.data.endereco.fone,
                                observacao: body.data.observacao,
                                observacoes: body.data.observacoes,
                                endereco_id: body.data.endereco.id,
                                tipoResponsavel: body.data.tipoResponsavel,
                                idRespon: body.data.escola.id,
                                nomeRespon: body.data.escola.nome,
                                page: rota,
                                itens: lista, informacoes: req.session.json, jsonescola: req.session.jsonescola
                            });
                        } else {
                            res.redirect('/');
                        };
                        req.session.IdEscola = body.data.escola.id;
                        nomeRespon = body.data.escola.nome;                
                    }
                });
            });

        } else {
            teste = request({
                url: process.env.API_HOST + 'responsavel/escola/' + req.session.escola,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            },
                function (error, response, body) {
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
                            logradouro: body.data[i].endereco.logradouro
                        };
                        lista.push(finallista);
                    }
                    /*res.format({
                        html: function() {
                            res.render(rota + '/Create', { itens: lista, page: rota  });
    
                        }
                    });*/
                    return lista;
                });
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
                var dated = moment(body.data.nascimento).format("YYYY-MM-DD");

                res.format({
                    html: function () {
                        res.render(rota + '/Edit', {
                            id: body.data.id,
                            nome: body.data.nome,
                            series: body.data.serie.series,
                            serie_id: body.data.serie.id,
                            nascimento: dated,
                            responsavel_id: body.data.responsavel == null ? '' : body.data.responsavel.id,
                            responsavel_nome: body.data.responsavel == null ? '' : body.data.responsavel.nome,
                            bairro: body.data.endereco.bairro,
                            logradouro: body.data.endereco.logradouro,
                            numero: body.data.endereco.numero,
                            cep: body.data.endereco.cep,
                            celular: body.data.endereco.celular,
                            fone: body.data.endereco.fone,
                            endereco_id: body.data.endereco.id,
                            tipoResponsavel: body.data.tipoResponsavel,
                            page: rota,
                            itens: lista, informacoes: req.session.json, jsonescola: req.session.jsonescola
                        });
                    }
                });
            });

        }
    });

    // Rota para receber parametros via post editar item

    app.post('/app/' + rota + '/edit/submit', upload.single('photo'), function (req, res) {
        responsavel = S(req.body.responsavel).splitLeft(',');
        bairro = req.body.bairro;
        numero = req.body.numero;
        logradouro = req.body.logradouro;
        cep = req.body.cep;
        fone = req.body.fone;
        celular = req.body.celular;
        
        if (req.body.bairro == '' || req.body.bairro == null) {
            responsavel_id = responsavel[0];
            bairro = responsavel[3];
            numero = responsavel[2];
            logradouro = responsavel[1];
            cep = responsavel[4]
            fone = responsavel[5]
            celular = responsavel[6]
        };
        if (req.session.json.NivelUser != 'ESCOLA') {
            request({
                url: process.env.API_HOST + rota,
                method: "PUT",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
                json: {
                    "endereco": {
                        "bairro": bairro,
                        "celular": celular,
                        "cep": cep,
                        "fone": fone,
                        "logradouro": logradouro,
                        "numero": numero,
                        "id": req.body.endereco_id
                    },
                    "escola": {
                        "id": req.session.IdEscola,
                    },
                    "nome": req.body.nome,
                    "id": req.body.id,
                    "nascimento": req.body.nascimento,
                    "tipoDeficiencia": req.body.tipoDeficiencia,
                    "alergico": req.body.alergico,
                    "tipoAlergia": req.body.tipoAlergia,
                    "serie": {
                        "id": req.body.serie_id,
                        "series": req.body.serie_nome
                    },
                    "tipoResponsavel": req.body.tipoResponsavel
                },
            }, function (error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Item não atualizado. " + body.errors);
                } else {
                    req.flash("success", "Item atualizado com sucesso.");
                }

                res.redirect('/app/' + rota + '/list/' + req.session.IdEscola + '/' + nomeRespon );
                return true;
            });
        } else {
            request({
                url: process.env.API_HOST + rota,
                method: "PUT",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
                json: {
                    "endereco": {
                        "bairro": bairro,
                        "celular": celular,
                        "cep": cep,
                        "fone": fone,
                        "logradouro": logradouro,
                        "numero": numero,
                        "id": req.body.endereco_id
                    },
                    "escola": {
                        "id": req.session.IdEscola,
                    },
                    "nome": req.body.nome,
                    "id": req.body.id,
                    "nascimento": req.body.nascimento,
                    "responsavel": {
                        "id": responsavel_id,
                    },
                    "serie": {
                        "id": req.body.serie_id,
                        "series": req.body.serie_nome
                    },
                    "tipoResponsavel": req.body.tipoResponsavel
                },
            }, function (error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Item não atualizado. " + body.errors);
                } else {
                    req.flash("success", "Item atualizado com sucesso.");
                }

                res.redirect('/app/' + rota + '/list/' + req.session.IdEscola);
                return true;
            });
        }
    });

    // Rota para exclusão de um item
    app.post('/app/' + rota + '/delete/', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + "/" + req.body.idCrianca,
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

                res.redirect('/app/' + rota + '/list/' + req.body.idResponsavel);
                return true;
            });

        }
    });

}