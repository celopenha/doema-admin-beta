const rota = require('path').basename(__filename, '.js');


module.exports = async (app) => {
	app.get('/public', (req, res) => {
		res.render(`${rota}/index`);
	});

	app.get('/public/biblioteca', (req, res) => {
		res.render('public/Biblioteca');
	});

	app.post('/public/jornal/listar', (req, res) => {
		console.log(req.body);

		res.render('public/JornalList');
	});
}