const rota = require('path').basename(__filename, '.js');


module.exports = async (app) => {
    app.get('/public', (req, res) => {
        res.render(`${rota}/index`);
    })
}