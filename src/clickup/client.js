const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.clickup.com/api/v2',
  headers: {
    'Authorization': process.env.CLICKUP_API_TOKEN,
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor para tratar erros da API
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const msg = data.err || data.message || 'Erro desconhecido';
      console.error(`[ClickUp API] Erro ${status}: ${msg}`);
      throw new Error(`ClickUp API (${status}): ${msg}`);
    }
    throw error;
  }
);

module.exports = client;
