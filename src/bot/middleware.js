/**
 * Middleware de segurança — só permite o dono do bot usar
 */
function authMiddleware() {
  return (ctx, next) => {
    const allowedId = process.env.TELEGRAM_ALLOWED_USER_ID;
    
    // Se não configurou user ID, permite todos (modo dev)
    if (!allowedId) {
      console.log(`⚠️  Sem TELEGRAM_ALLOWED_USER_ID configurado. User ${ctx.from?.id} (${ctx.from?.username}) acessou.`);
      return next();
    }

    if (String(ctx.from?.id) === String(allowedId)) {
      return next();
    }

    console.log(`🚫 Acesso negado para user ${ctx.from?.id} (${ctx.from?.username})`);
    return ctx.reply('⛔ Acesso negado. Este bot é privado.');
  };
}

/**
 * Middleware de log — registra todos os comandos
 */
function logMiddleware() {
  return (ctx, next) => {
    const user = ctx.from?.username || ctx.from?.id;
    const text = ctx.message?.text || '';
    console.log(`📩 [${new Date().toLocaleTimeString('pt-BR')}] @${user}: ${text}`);
    return next();
  };
}

module.exports = {
  authMiddleware,
  logMiddleware,
};
