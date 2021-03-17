const rota = require('path').basename(__filename, '.js');
const axios = require('axios').default;
var moment = require('moment');


module.exports = async (app) => {
  app.get('/inicio', async (req, res) => {

    // URL'S PARA BUSCAR DADOS (MENSAGEM E FERIADOS) NA API
    const msgUrl = `${process.env.API_HOST}mensagem/ultima-mensagem`;
    const feriadosUrl = `${process.env.API_HOST}feriados/`;
    // FUNÇÃO QUE VERIFICA SE A ÚLTIMA MENSAGEM DO BANCO ESTÁEXPIRADA
    const isMessageExpired = (expirationDate) => {
      const actualDate = new Date();
      const actualDateInSeconds = Date.parse(actualDate);
      const expirationDateInSeconds = Date.parse(expirationDate);
      expirationDateInSeconds > actualDateInSeconds
        ? true
        : false;
    }
    // BLOCO UTILIZANDO ASYNC AWAIT
    try {
      const msgResponse = await (await axios.get(msgUrl)).data
      const mensagem = {
        id: msgResponse.data.id,
        titulo: msgResponse.data.titulo,
        base64Img: msgResponse.data.mensagem,
        dataExpiracao: msgResponse.data.dataExpiracao,
        expirada: isMessageExpired(msgResponse.data.dataExpiracao)
      }

      const responseFeriados = await (await axios.get(feriadosUrl)).data;
      // TRANSFORMANDO VALORES EM VALORES COMPATÍVEIS COM O FULL-CALLENDAR
      const feriados = await responseFeriados.data.map(feriado => {
        return {
          id: feriado.id,
          title: feriado.titulo,
          start: feriado.dia,
          startModal: moment(feriado.dia).format('DD/MM/YYYY'),
          endModal: feriado.descricao,
          color: "#34d3",
          title2: feriado.titulo
        }
      });
      // VERIFICA SE A MENSAGEM ESTÁ EXPIRADA
      // SE ESTIVER, ENVIA APENAS OS FERIADOS,
      // CASO NÃO TENHA EXPIRADO, ENVIA AMBOS
      console.log(feriados)
      mensagem.expirada
        ? res.render("public/index", { feriados })
        : res.render("public/index", { mensagem, feriados })

    } catch (e) {
      console.log(e);
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