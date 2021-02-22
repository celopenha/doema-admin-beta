module.exports = (messageData) => {

    return `https://api.telegram.org/bot${process.env.TOKEN_TELEGRAM}/sendMessage?text=${messageData}&chat_id=-543169616`;
}

// const bot = new TelegramBot(process.env.TOKEN_TELEGRAM, { polling: true });

// var logErrorEcho = function logErrorEcho(msg) {
//     return function (err) {
//         return console.log(msg, err);
//     };
// };

// var logSuccessEcho = function (msg, match) {
//     return function (data) {
//         console.log('Success:', data);
//     };
// };

// var enviarMsg = (msg, match) => {

//     bot.sendMessage(msg.chat.id, match[1])
//         .then(logSuccessEcho(msg, match))
//         .catch(logErrorEcho('Error:'));
// }

// bot.onText(/\/echo (.*)/, enviarMsg);


