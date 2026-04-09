require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const { authMiddleware, logMiddleware } = require('./bot/middleware');
const { registerCommands } = require('./bot/commands');
const { registerVoiceHandler, registerTextAIHandler } = require('./bot/voice');
const { initScheduler } = require('./bot/scheduler');

// Validação de variáveis de ambiente
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN não configurado no .env');
  process.exit(1);
}

if (!process.env.CLICKUP_API_TOKEN) {
  console.error('❌ CLICKUP_API_TOKEN não configurado no .env');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY não configurado — comandos de voz desativados');
}

// Inicializar o bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Registrar middlewares
bot.use(logMiddleware());
bot.use(authMiddleware());

// Registrar comandos (slash commands tradicionais)
registerCommands(bot);

// Registrar handler de voz (áudio → transcrição → IA → ClickUp)
registerVoiceHandler(bot);

// Registrar handler de texto inteligente (conversa livre com IA)
// IMPORTANTE: deve ficar DEPOIS dos comandos para não interceptar /comandos
registerTextAIHandler(bot);

// Inicializa jobs agendados (como o resumo de 7am)
initScheduler(bot);

// Tratamento de erros
bot.catch((err, ctx) => {
  console.error(`❌ Erro no bot para ${ctx.updateType}:`, err);
  ctx.reply('❌ Ocorreu um erro inesperado. Tente novamente.');
});

// Iniciar o bot
bot.launch()
  .then(() => {
    console.log('');
    console.log('🤖 ═══════════════════════════════════════');
    console.log('   ClickUp Bot — Online!');
    console.log('   Bot: @clickupgolfbot');
    console.log(`   Segurança: ${process.env.TELEGRAM_ALLOWED_USER_ID ? '🔒 Restrito ao user ' + process.env.TELEGRAM_ALLOWED_USER_ID : '⚠️  Aberto (configure TELEGRAM_ALLOWED_USER_ID)'}`);
    console.log('   Horário: ' + new Date().toLocaleString('pt-BR'));
    console.log('═══════════════════════════════════════════');
    console.log('');
  });

// Servidor Web "Fantasma" para manter nuvens como Render/Railway vivas
const app = express();
app.get('/', (req, res) => res.send('Bot do ClickUp + Telegram Online! 🚀'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Servidor Web escutando na porta ${PORT}`);
});

// Encerramento gracioso
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
