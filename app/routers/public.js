const rota = require('path').basename(__filename, '.js');
const moment = require('moment');
const axios = require('axios').default;

module.exports = async (app) => {
  app.get('/inicio', async (req, res) => {
    // url do ENDPOINT P/ RESGATAR A ÚLTIMA MENSAGEM CADASTRADA DIRETAMENTE NA API
    const msgUrl = `${process.env.API_HOST}mensagem/ultima-mensagem`;
    // REQUISIÇÃO À API
    const response = (await axios.get(msgUrl)).data;
    //***** FUNÇÃO QUE COMPARA DATA ATUAL COM DATA DE EXPIRAÇÃO (RETORNA TRUE OU FALSE) ******/
    const isMessageExpired = (date) => {
      // FUNÇÃO IRÁ CONVERTAR PARA OBJETO DATE() NATIVO DO JS
      // A ENTRADA DEVERÁ ESTAR NO FORMATO "DD/MM/YYYY"
      // MOMENT IRÁ FORÇAR ESTE FORMATO
      // SPLIT IRÁ CRIAR UM VETOR CONTENTO OS FRAGMENTOS DA DATA
      const dateFragment = moment(date).format("DD/MM/YYYY").split("/");
      console.log(date);
      console.log(dateFragment, "oi")
      // DATA DE EXPIRAÇÃO NO FORMATO JS DATE
      const dataExpiracao = new Date(dateFragment[2], dateFragment[1] - 1, dateFragment[0]);
      // DATA ATUAL NO FORMATO JS DATE
      const hoje = new Date();
      console.log(hoje)
      console.log(dataExpiracao)
      // COMPARAÇÃO ENTRE DATAS
      return hoje > dataExpiracao;
    }
    const mensagem = {
      id: response.data.id,
      titulo: response.data.titulo,
      base64Img: response.data.mensagem,
      dataExpiracao: moment(response.data.dataExpiracao).format("DD/MM/YYYY"),
    }

    if (isMessageExpired(mensagem.dataExpiracao)) {
      return res.render("public/index", { mensagem })
    } else {
      return res.render("public/index")
    }
  });


  app.get('/public/biblioteca', (req, res) => {
    res.render('public/Biblioteca');
  });

  app.post('/public/jornal/listar', (req, res) => {

    res.render('public/JornalList');
  });


  app.post('/public/biblioteca/listar', function (req, res) {


    res.format({
      html: function () {
        res.render(rota + '/Create', {
          page: rota,
          informacoes: req.session.json
        });
      }
    });
  });


  app.get("/informativo/historia", function (req, res) {
    res.render("public/informativo/historia");
  });
  app.get("/informativo/legislacao", function (req, res) {
    res.render("public/informativo/legislacao");
  });
  app.get("/informativo/modelo-publicacao", function (req, res) {
    res.render("public/informativo/modelo-publicacao");
  });
  app.get("/informativo/normas-publicacao", function (req, res) {
    res.render("public/informativo/normas-publicacao");
  });
  app.get("/informativo/prazo-publicacao", function (req, res) {
    res.render("public/informativo/prazo-publicacao");
  });

}