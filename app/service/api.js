const axios = require('axios');

// Pode ser algum servidor executando localmente: 
// http://localhost:3000

module.exports = axios.create({
  baseURL: process.env.API_HOST,
});


