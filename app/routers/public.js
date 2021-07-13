const rota = require('path').basename(__filename, '.js');
const axios = require('axios').default;
var moment = require('moment');


module.exports = async (app) => {
  app.get('/inicio', async (req, res) => {
    // URL'S PARA BUSCAR DADOS (MENSAGEM E FERIADOS) NA API
    const msgUrl = `${process.env.API_HOST}mensagem/ultima-mensagem`;
    const feriadosUrl = `${process.env.API_HOST}feriados/`;
    // FUNÇÃO QUE VERIFICA SE A ÚLTIMA MENSAGEM DO BANCO ESTÁ EXPIRADA
    const isMessageExpired = (expirationDate) => {
      const actualDate = new Date();
      const actualDateInSeconds = Date.parse(actualDate);
      const expirationDateInSeconds = Date.parse(expirationDate);
      expirationDateInSeconds > actualDateInSeconds
        ? true
        : false;
    }
    // BLOCO UTILIZANDO ASYNC AWAIT + AXIOS 
    // O SPRING SEMPRE IRÁ RETORNAR A ÚLTIMA MENSAGEM
    // através de UMA QUERY PERSONALISADA.
    try {
      const messageResponse = await (await axios.get(msgUrl)).data
      const mensagem = {
        id: messageResponse.data.id,
        titulo: messageResponse.data.titulo,
        base64Img: messageResponse.data.mensagem,
        dataExpiracao: messageResponse.data.dataExpiracao,
        expirada: isMessageExpired(messageResponse.data.dataExpiracao)
      }

      // TRANSFORMANDO VALORES EM VALORES COMPATÍVEIS COM O FULL-CALLENDAR
      const feriadosResponse = await (await axios.get(feriadosUrl)).data;
      const feriados = await feriadosResponse.data.map(feriado => {
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
      // utilizando operador ternário.
      mensagem.expirada
        ? res.render("public/index", { feriados })
        : res.render("public/index", { mensagem, feriados })

    } catch (e) {
      console.log(e);
      res.render("public/index")
    }
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

  app.get("/testando", (req, res) => {
    res.render("public/Biblioteca")
  })

}

