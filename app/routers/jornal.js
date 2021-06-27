require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { default: axios } = require('axios');
const rota = require('path').basename(__filename, '.js');
const upload = require('multer')();


module.exports = async function (app) {

  app.use(cookieParser());
  app.use(session({ secret: "2C44-4D44-WppQ38S" }));


  // VIEW CRIAR JORNAL
  app.get('/app/' + rota + '/create', (req, res) => {

    res.format({
      html: function () {
        res.render('jornal/Create', { informacoes: req.session.json });
      }
    })
  });
  // ROTA CRIAR JORNAL
  app.post('/app/' + rota + '/create/submit', upload.single('jornal'), (req, res) => {

    request({
      url: process.env.API_HOST + rota + "/jornal",
      method: "POST",
      headers: {
        "Authorization": req.session.token
      },
      formData: {
        "regularField": "someValue",
        customBufferFile: {
          value: req.file.buffer,

        }
      }

    }, function (error, response, body) {

      if (response.statusCode != 200) {
        req.flash("danger", "Não foi possível criar usuário. " + body.errors);
      } else {
        req.flash("success", "Mensagem cadastrada com sucesso.");

        request
          .get(sendTelegramMessage(req.body.titulo))
          .on('response', function (response) {
            console.log(response.statusCode)
          })
      }
      res.redirect('/app/' + rota + '/list');
      return true;
    });




  });
  // LISTAR TODOS OS JORNAIS
  app.get('/app/' + rota + '/list', (req, res) => {

    res.format({
      html: function () {
        res.render('jornal/List', { informacoes: req.session.json });
      }
    });
  });

  app.get(`/app/${rota}/pesquisar`, (request, response) => {
    response.render("public/jornal/Pesquisar");

  });
  
  app.post(`/app/${rota}/pesquisar/submit`, (request, response) => {

    // const { termo, dataInicio, dataFim, caderno } = request.body;
    // const dados = {
    //   termo,
    //   dataInicio,
    //   dataFim,
    //   caderno
    // }
    const { termo } = request.body;
    // enviando o termo para o spring-boot coletar e processar
    // a consulta, retornando uma lista de resultados
    //obtidos pelo search do apache lucene.
    axios.post(`${process.env.API_HOST}jornal/enviar`, {termo} )
      .then(response => response.data)
      .then(data => {
        let termo = data;
        console.log(termo)
        response.render("public/jornal/Resultado", {termo});
    });
  });

}