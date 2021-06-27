const nodemailer = require('nodemailer');

const gmailConfig = {
  host: "smtp.gmail.com",
  port: 587,
  user: "niqcelo@gmail.com",
  pass: "Marcola100@"
}


const transporter = nodemailer.createTransport({
  host: gmailConfig.host,
  port: gmailConfig.port,
  secure: false,
  auth: {
    user: gmailConfig.user,
    pass: gmailConfig.pass
  },
  tls: {
    rejectUnauthorized: false
  }
});

const enviarResposta = async (email, arquivos)=>{

  const mailSent = await transporter.sendMail({
    text: "TEXTO DE E-MAIL",
    subject: "TESTANDO ENVIO DE E-MAIL PELO NODEJS",
    from: "Marcelo Filho <niqcelo@gmail.com>",
    to: [`${email}`],
    attachments: [
      {
        filename: 'text2.txt',
        content: new Buffer('hello world!', 'utf-8')
      }
    ],
    html: `
    <h1 style="color: red; text-align: center" >OLÁ, ESTE É UM E-MAIL</h1>
    <img src="https://nodemailer.com/nm_logo_200x136.png">
    `
  });
}



run();

