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
var moment = require('moment');
var S = require('string');
const { Console } = require('console');


let nivel;
let lista = [];
let criancas = [];
let crianca_id = [];
let username;
let imagem;
let finallista = {};
let json = {};
let teste;
let listaDois = [];
let listaRespon = [];
//const Array = require('array');
//export const list2 = "teste";


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

    // Rota para exibição da View Criança Sessão
    app.get('/app/' + rota + '/list/:sessaoId', function (req, res) {

        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
                page = process.env.API_HOST + rota + "/sessao/" + req.params.sessaoId;
            req.session.json.controlRota = "listSessao";
            var nomesessao;
            request({
                url: process.env.API_HOST + "sessao/" + req.params.sessaoId,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                if (response.statusCode == 200) {
                    nomesessao =  'da sessão: ' + body.data.sessao;
                } else {
                    nomesessao = '';
                }
            });

            

            request({
                url: page,
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
                    str = S(str).replace('_', '-');
                    return ((str.replace(/O$/m, "O(A)")).replace('IRMA', 'IRMÃ')).replace(/(\w)(\S*)/g, function (x) {
                        return x.charAt(0).toUpperCase() + x.substr(1).toLowerCase();
                    });
                };
                function convertCase2(str) {
                    str = S(str).replace('_', '-');
                    return (str.replace(/O$/m, "O(A)")).replace(/(\w)(\S*)/g, function (x) {
                        return x.charAt(0).toUpperCase() + x.substr(1).toLowerCase();
                    });
                };
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finallista = {
                        id: body.data[i].id,
                        escolaId: body.data[i].escola.id,
                        sessaoId: body.data[i].sessao.id,
                        sessao: body.data[i].sessao.sessao,
                        servico: body.data[i].sessao.servico.nome,
                        responsavel: body.data[i].escola.nome,
                        celular: body.data[i].escola.endereco.celular,
                        vagas: body.data[i].vagas,
                        vagasRestantes: body.data[i].vagasRestantes,
                        codigo: body.data[i].codigo,
                        statusAgendamento: body.data[i].statusAgendamento,
                        statusPresenca: convertCase(body.data[i].statusPresenca),
                        statusPresencaOriginal: body.data[i].statusPresenca,
                        statusCase: convertCase2(body.data[i].statusAgendamento),
                        dia: moment(body.data[i].dia).format('DD/MM/YYYY HH:mm'),
                    };
                    lista.push(finallista);
                }

                res.format({
                    html: function () {
                        res.render(rota + '/List', { itens: lista, nomesessao , sessaoId: req.params.sessaoId, page: rota, informacoes: req.session.json, jsonescola: req.session.jsonescola, controlRota: req.session.json.controlRota });
                    }
                });
            });
        }
    });

    // Rota para exibição da View Criança Sessão
    app.get('/app/' + rota + '/list/responsavel/:idRespon', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {       
            if (req.session.json.NivelUser == "ADMIN" && typeof req.params.idRespon != "undefined") {
                page = process.env.API_HOST + rota + "/escola/" + req.params.idRespon;
                req.session.json.controlRota = "listRespon";
                request({
                    url: process.env.API_HOST + "escola/" + req.params.idRespon,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, function (error, response, body) {
                    if (response.statusCode == 200) {
                        nomesessao =  'do responsável: ' + body.data.nome;
                    } else {
                        nomesessao = '';
                    }
                    
                });
                
            } else {
                page = process.env.API_HOST + rota + "/escola/" + req.session.jsonescola.IdEscola;
                nomesessao = ' ';
            }

            request({
                url: page,
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
                    str = S(str).replace('_', '-');
                    return str.replace(/(\w)(\S*)/g, function (x) {
                        return x.charAt(0).toUpperCase() + x.substr(1).toLowerCase();
                    });
        
                };
                
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finallista = {
                        id: body.data[i].id,
                        codigo: body.data[i].codigo,
                        escolaId: body.data[i].escola.id,
                        sessaoId: body.data[i].sessao.id,
                        sessao: body.data[i].sessao.sessao,
                        servico: body.data[i].sessao.servico.nome,
                        responsavel: body.data[i].escola.nome,
                        celular: body.data[i].escola.endereco.celular,
                        vagas: body.data[i].vagas,
                        codigo: body.data[i].codigo,
                        statusAgendamento: body.data[i].statusAgendamento,
                        statusPresenca: convertCase(body.data[i].statusPresenca),
                        statusCase: convertCase(body.data[i].statusAgendamento),
                        dia: moment(body.data[i].dia).format('DD/MM/YYYY HH:mm'),
                    };
                    lista.push(finallista);
                }
                res.format({
                    html: function () {
                        res.render(rota + '/List', { itens: lista, page: rota, informacoes: req.session.json, jsonescola: req.session.jsonescola, nomesessao, controlRota: req.session.json.controlRota });
                    }
                });
                return lista;                    
            });
        }
    });
    

    // Rota para exibição da View Criar
    app.get('/app/' + rota + '/create/:sessaoId?/:IdEscola?', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            if (req.session.json.NivelUser == 'ADMIN') {
                req.session.jsonescola.IdEscola = req.params.IdEscola;
            }
            request({
                url: process.env.API_HOST + rota + '/verifica/' + req.params.sessaoId + '/' + req.session.jsonescola.IdEscola,
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
                } else {
                    if (body.data == true) {
                        req.flash("danger", "Só é possível agendar novamente após 15 dias da última sessão no mesmo serviço.");
                        res.redirect('/app/servico/list');
                        return false;
                    } else {
                        request({
                            url: process.env.API_HOST + 'escola/' + req.session.jsonescola.IdEscola,
                            method: "GET",
                            json: true,
                            headers: {
                                "content-type": "application/json",
                                "Authorization": req.session.token
                            },
                        }, async function (error, response, body) {
                            if (response.statusCode != 200) {
                                req.flash("danger", "Ops, ocorreu um erro.");
                                req.session.destroy();
                                res.redirect('/app/login');
                            }
                            req.session.past2 = new Date(body.data.agendamento);
                            
                            request({
                                url: process.env.API_HOST + 'sessao/' + req.params.sessaoId,
                                method: "GET",
                                json: true,
                                headers: {
                                    "content-type": "application/json",
                                    "Authorization": req.session.token
                                }
                            }, async function (error, response, body) {
                                if (response.statusCode != 200) {
                                    req.flash("danger", "Ops, ocorreu um erro.");
                                    req.session.destroy();
                                    res.redirect('/app/login');
                                }
                                if (body.data.vagasRestantes == 0) {
                                    req.flash("danger", "Não há vagas para essa sessão.");
            
                                    res.redirect('/app/servico/list');
                                    return false;
                                }
                                var now = new Date(); // Data de hoje
                                req.session.past = new Date(body.data.horaInicio);
                                
                                diff = (req.session.past.getTime() - now.getTime()); // Subtrai uma data pela outra
                                req.session.limiteHoje = Math.ceil(diff / (1000 * 60 * 60 * 24)); // Divide o total pelo total de milisegundos correspondentes a 1 dia. (1000 milisegundos = 1 segundo).
            
                                if (req.session.limiteHoje < 0) {
                                    req.flash("danger", "Só é possível agendar sessão posterior a data atual.");
            
                                    res.redirect('/app/servico/list');
                                    return false;
                                }
                                
                                const camposAdicionais = body.data.servico.camposAdicionais;
                                var sessaoId = req.params.sessaoId;
            
                                now2 = new Date(body.data.horaInicio); // Data de hoje
                                
            
                                diff = Math.abs(now2.getTime() - req.session.past2.getTime()); // Subtrai uma data pela outra
                                req.session.agendamento = Math.ceil(diff / (1000 * 60 * 60 * 24)); // Divide o total pelo total de milisegundos correspondentes a 1 dia. (1000 milisegundos = 1 segundo).
                                console.log((body.data.diasAntes).length > 2);
                                console.log(body.data.diasAntes);
                                if ((body.data.diasAntes).length > 2) {
                                    req.session.msgErroDiasAntes =  "Só é possível agendar nesta sessão até a data: " + moment(body.data.diasAntes).format('DD/MM/YYYY HH:mm') + ".";
                                    req.session.dateCalc = body.data.diasAntes;
                                    req.session.dateControl = 0;
                                } else {
                                    req.session.msgErroDiasAntes = "Só é possível agendar nesta sessão com antecedência mínima de " + body.data.diasAntes + " dias.";
                                    req.session.dateCalc = body.data.horaInicio;
                                    req.session.dateControl = body.data.diasAntes;
                                }
            
                                now2 = new Date(); // Data de hoje
                                past2 = new Date(req.session.dateCalc);
            
                                diff2 = (past2.getTime() - now2.getTime()); // Subtrai uma data pela outra
                                req.session.diaAntes = Math.ceil(diff2 / (1000 * 60 * 60 * 24)); // Divide o total pelo total de milisegundos correspondentes a 1 dia. (1000 milisegundos = 1 segundo).
            
                                if (req.session.diaAntes <= req.session.dateControl) {
                                    req.flash("danger",req.session.msgErroDiasAntes);
                                    res.redirect('/app/crianca-sessao/list/' + sessaoId);
                                    return false;
                                }
            
                                const finallista = {
                                    id: sessaoId,
                                    sessao: body.data.sessao,
                                    horaInicio: body.data.horaInicio,
                                    horaFim: body.data.horaFim,
                                    vagasRestantes: body.data.vagasRestantes,
                                    vagasResponsavel: body.data.vagasResponsavel,
                                    vagas: body.data.vagas,
                                    cor: body.data.cor,
                                    aniversario: body.data.servico.aniversario
                                };                    
            
                                request({
                                    url: process.env.API_HOST + 'crianca/escola/' + req.session.jsonescola.IdEscola,
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
                                    listaDois = [];
                                    if (body.data != null) {
                                        for (var i = 0; i < Object.keys(body.data).length; i++) {
                                            const finallista = {
                                                id: body.data[i].id,
                                                nome: body.data[i].nome,
            
                                            };
                                            listaDois.push(finallista);
                                        }
                                    }
                                    res.format({
                                        html: function () {
                                            res.render(rota + '/Create', {
                                                camposAdicionais: camposAdicionais, itensDois: listaDois, itens: finallista, sessaoId, page: rota, informacoes: req.session.json, jsonescola: req.session.jsonescola,});
                                        }
                                    });
                                });
                            });
                        });
                    }
                }
            });

            
        };
    });


    // Rota para receber parametros via post criar item
    app.post('/app/' + rota + '/create/submit', upload.array('campodvalor'), function (req, res) {
        let criancas = [];
        if (Array.isArray(req.body.crianca_id)) {
            for (var i = 0; i < (req.body.crianca_id).length; i++) {
                const crianca = {
                    id: req.body.crianca_id[i],
                };
                criancas.push(crianca);
            }
        } else {
            const crianca = {
                id: req.body.crianca_id
            }
            criancas.push(crianca);
        }
        date = moment(req.body.dia).toDate();
        req.session.past = new Date(date);
        request({
            url: process.env.API_HOST + 'escola/' + req.session.jsonescola.IdEscola,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
        }, async function (error, response, body) {
            if (response.statusCode != 200) {
                req.flash("danger", "Ops, ocorreu um erro.");
                req.session.destroy();
                res.redirect('/app/login');
            }
            
            req.session.past = new Date(body.data.agendamento);
            request({
                url: process.env.API_HOST + 'sessao/' + req.body.sessao_id,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, async function (error, response, body) {
                if (response.statusCode != 200) {
                    req.flash("danger", "Ops, ocorreu um erro.");
                    req.session.destroy();
                    res.redirect('/app/login');
                }
                const camposadicionaisvalor = [];
    
                var sessaoId = req.params.sessaoId;

                now = new Date(body.data.horaInicio); // Data de hoje
                

                diff = Math.abs(now.getTime() - req.session.past.getTime()); // Subtrai uma data pela outra
                req.session.agendamento = Math.ceil(diff / (1000 * 60 * 60 * 24)); // Divide o total pelo total de milisegundos correspondentes a 1 dia. (1000 milisegundos = 1 segundo).


                if (body.data.servico.camposAdicionais.length > 0) {
                    if (Array.isArray(req.body.campoid)) {
                        for (let i = 0; i < req.body.campoid.length; i++) {
                            const campovalor = {
                                "valor": req.body.campovalor[i],
                                "campoAdicional": {"id": req.body.campoid[i]}
                            }
                            camposadicionaisvalor.push(campovalor);
                        }
                    } else {
                        const campovalor = {
                            "valor": req.body.campovalor,
                            "campoAdicional": {"id": req.body.campoid}
                        }
                        camposadicionaisvalor.push(campovalor);
                    }
                }

                if ((body.data.diasAntes).length > 2) {
                    msgErroDiasAntes = "danger", "Só é possível agendar nesta sessão até a data: " + body.data.diasAntes + " dias.";
                    req.session.dateCalc = body.data.diasAntes;
                    req.session.dateControl = 0;
                } else {
                    msgErroDiasAntes = "danger", "Só é possível agendar nesta sessão com antecedência mínima de " + body.data.diasAntes + " dias.";
                    req.session.dateCalc = body.data.horaInicio;
                    req.session.dateControl = body.data.diasAntes;
                }

                now2 = new Date(); // Data de hoje
                past2 = new Date(req.session.dateCalc);

                diff2 = (past2.getTime() - now2.getTime()); // Subtrai uma data pela outra
                req.session.diaAntes = Math.ceil(diff2 / (1000 * 60 * 60 * 24)); // Divide o total pelo total de milisegundos correspondentes a 1 dia. (1000 milisegundos = 1 segundo).

                erro = false;
                if (req.body.aniversario == 'false') {
                    if (body.data.vagasRestantes < (req.body.crianca_id).length) {
                        erro = true;
                        msg = "Quantidade de vagas insuficiente.";
                    }
                    if ((req.body.crianca_id).length > body.data.vagasResponsavel) {
                        erro = true;
                        msg = "A quantidade de crianças ultrapassou o limite de vagas por responsável desta sessão.";
                    }
                }
                if (req.session.diaAntes <= req.session.dateControl) {
                    erro = true;
                    msg = msgErroDiasAntes;
                }
                json = {
                    "dia": date,
                    "statusAgendamento": "PRE_AGENDADO",
                    "statusPresenca": "NAO_AVALIADO",
                    "escola": {
                        "id": req.session.jsonescola.IdEscola,
                        "agendamento": date
                    },
                    "vagas": req.body.aniversario == 'false' ? criancas : [],
                    "sessao": {
                        "id": req.body.sessao_id,
                        "vagas": req.body.aniversario == 'false' ? req.body.vagasRestantes : 0
                    },
                    "valoresCamposAdicionais": camposadicionaisvalor
                };
                if (erro == false) {
                    request({
                        url: process.env.API_HOST + rota,
                        method: "POST",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                            "Authorization": req.session.token
                        },
                        json: {
                            "dia": date,
                            "statusAgendamento": "PRE_AGENDADO",
                            "statusPresenca": "NAO_AVALIADO",
                            "escola": {
                                "id": req.session.jsonescola.IdEscola,
                                "agendamento": date
                            },
                            "vagas": req.body.aniversario == 'false' ? criancas : [],
                            "sessao": {
                                "id": req.body.sessao_id,
                                "vagas": req.body.aniversario == 'false' ? req.body.vagasRestantes : 0
                            },
                            "valoresCamposAdicionais": camposadicionaisvalor
                        },
                    }, function (error, response, corpo) {
                        if (response.statusCode != 200 || req.body.vagasRestantes < 0) {
                            req.flash("danger", "Não foi possível agendar. " + corpo.errors);
                            return false;
                        } else {
                            req.flash("success", "Agendamento realizado com sucesso.");                            
                        }

                        if(req.session.json.NivelUser != 'ADMIN') {
                            res.redirect('/app/crianca-sessao/list/responsavel/'+ req.session.jsonescola.IdEscola);
                        } else {
                            res.redirect('/app/crianca-sessao/list/'+ req.body.sessao_id);
                        }
                        return true;
                    });
                } else {
                    req.flash("danger", msg);
                    if(req.session.json.NivelUser != 'ADMIN') {
                        res.redirect('/app/crianca-sessao/list/responsavel/'+ req.session.jsonescola.IdEscola);
                    } else {
                        res.redirect('/app/crianca-sessao/list/'+ req.body.sessao_id);
                    }
                    return false;
                    
                }
            });
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
                if (body.data.dia) {
                    date = moment(body.data.dia).format('YYYY-MM-DD HH:mm');
                    date = date.replace(' ', 'T');
                };
                res.format({
                    html: function () {
                        res.render(rota + '/Edit', {
                            id: req.params.id,
                            dia: date,
                            statusAgendamento: body.data.statusAgendamento,
                            statusPresenca: body.data.statusPresenca,
                            tipoEscolaResponsavel: body.data.escola.tipoEscolaResponsavel,
                            vagasRestantes: body.data.sessao.vagasRestantes,
                            vagas: body.data.vagas,
                            IdEscola: body.data.escola.id,
                            nomeEscola: body.data.escola.nome,
                            sessao_id: body.data.sessao.id,
                            sessao: body.data.sessao.sessao,
                            aniversario: body.data.sessao.servico.aniversario,
                            camposadicionais: body.data.valoresCamposAdicionais,
                            page: rota,
                            itens: lista,
                            itensDois: listaDois,
                            informacoes: req.session.json, 
                            jsonescola: req.session.jsonescola
                        });
                    }
                });

            });
        }
    });


    // Rota para receber parametros via post editar presença
    app.post('/app/' + rota + '/edit-presenca/submit', upload.single('photo'), function (req, res) {
        criancas = [];
        for (var i = 0; i < (req.body.vagas).length; i++) {
            const crianca = {
                id: req.body.vagas[i].id,
            };
            criancas.push(crianca);
        }
        request({
            url: process.env.API_HOST + rota + '/presenca',
            method: "PUT",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "id": req.body.id,
                "codigo": req.body.codigo,
                "statusAgendamento": req.body.statusAgendamento,
                "statusPresenca": req.body.confPresenca,
                "escola": {
                    "id": req.body.escolaId
                },
                "vagas": req.body.aniversario == 'false' ? criancas : [],
                "sessao": {
                    "id": req.body.sessaoId
                }
            },
        }, function (error, response, body) {
            if (response.statusCode != 200) {
                req.flash("danger", "Presença não confirmada. " + body.errors);
                req.session.destroy();
                res.redirect('/app/login');
            } else {
                request({
                    url: process.env.API_HOST + rota + "/" + req.body.id,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, function (error, response, body) {
                    res.json({statusPresenca: body.data.statusPresenca});
                    return true;
                });
            }
        });
    });


    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit/submit', upload.single('photo'), function (req, res) {
        criancas = [];
        console.log('crianca_id = '+req.body.crianca_id);
        if (Array.isArray(req.body.crianca_id)) {
            for (var i = 0; i < (req.body.crianca_id).length; i++) {
                const crianca = {
                    id: req.body.crianca_id[i],
                };
                criancas.push(crianca);
            }
        } else {
            const crianca = {
                id: req.body.crianca_id,
            };
            criancas.push(crianca);
        }

        req.body.dia = moment(req.body.dia).toDate();

        request({
            url: process.env.API_HOST + 'crianca-sessao/' + req.body.id,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
        }, async function (error, response, body) {
            if (response.statusCode != 200) {
                req.flash("danger", "Ops, ocorreu um erro.");
                req.session.destroy();
                res.redirect('/app/login');
            }
            agendamento = new Date(body.data.escola.agendamento);

            resultadoAgend = req.body.dia - agendamento;

            erro = false;
            if (req.body.aniversario == 'true') {
                req.body.crianca_id = ['responsavel']
            }
            if (req.body.statusAgendamento != body.data.statusAgendamento) {
                if (req.body.statusAgendamento == "DESISTENCIA") {
                    body.data.sessao.vagasRestantes = body.data.sessao.vagasRestantes + (req.body.crianca_id).length;
                    if (resultadoAgend <= 0) {
                        agendamento = '';
                    }
                }
            };

            if (erro == false) {
                request({
                    url: process.env.API_HOST + rota + '/validacao',
                    method: "PUT",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                    json: {
                        "id": req.body.id,
                        "dia": req.body.dia,
                        "statusAgendamento": req.body.statusAgendamento,
                        "statusPresenca": req.body.statusPresenca,
                        "escola": {
                            "id": req.body.IdEscola,
                            "agendamento": agendamento
                        },
                        "vagas": req.body.aniversario == 'false' ? criancas : [],
                        "sessao": {
                            "id": req.body.sessao_id,
                            "vagasRestantes": body.data.sessao.vagasRestantes
                        },
                    },
                }, function (error, response, body) {
                    if (response.statusCode != 200) {
                        req.flash("danger", "Não foi possível alterar o item. " + body.errors);
                    } else {
                        req.flash("success", "Item alterado com sucesso.");
                    }
                    if(req.session.json.NivelUser != 'ADMIN') {
                        res.redirect('/app/crianca-sessao/list/responsavel/'+ req.session.jsonescola.IdEscola);
                    } else {
                        res.redirect('/app/crianca-sessao/list/'+ req.body.sessao_id);
                    }
                    return true;
                });
            } else {
                req.flash("danger", msg);
                if(req.session.json.NivelUser != 'ADMIN') {
                    res.redirect('/app/crianca-sessao/list/responsavel/'+ req.session.jsonescola.IdEscola);
                } else {
                    res.redirect('/app/crianca-sessao/list/'+ req.body.sessao_id);
                }
                return false;
            }

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

                if(req.session.json.NivelUser != 'ADMIN') {
                    res.redirect('/app/crianca-sessao/list/responsavel/'+ req.session.jsonescola.IdEscola);
                } else {
                    res.redirect('/app/crianca-sessao/list/'+ req.body.sessao_id);
                }
                return true;
            });

        }
    });

    app.get('/app/' + rota + '/:id/gerarpdf', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + "/" + req.params.id + "/gerarpdf",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
             /*   if (response.statusCode != 200) {
                    req.flash("danger", "Item não impresso. " + body.errors);
                } else {
                    req.flash("success", "Item impresso com sucesso.");
                } */

                res.json({arquivo: body.data});    
            });
            
        }
    });

};