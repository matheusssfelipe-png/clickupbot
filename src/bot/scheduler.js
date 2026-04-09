const cron = require('node-cron');
const axios = require('axios');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const CLICKUP_HEADERS = { 'Authorization': process.env.CLICKUP_API_TOKEN };

/**
 * Inicializa os jobs recorrentes
 */
function initScheduler(bot) {
  // Roda todos os dias às 07:00 no fuso de São Paulo
  cron.schedule('0 7 * * *', async () => {
    try {
      console.log('⏰ Executando Daily Briefing às 07:00...');
      await sendDailyBriefing(bot);
    } catch (err) {
      console.error('❌ Erro no scheduler diário:', err.message);
    }
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });
}

/**
 * Monta e envia o resumo diário
 */
async function sendDailyBriefing(bot) {
  const userId = process.env.TELEGRAM_ALLOWED_USER_ID;
  if (!userId) return;

  // 1. Buscar as tasks mais urgentes (due_date) assinadas para ele no Workspace Trizos
  // Pegamos as primeiras 30 tasks não finalizadas
  const res = await axios.get(
    'https://api.clickup.com/api/v2/team/9007019902/task' +
    '?assignees[]=55057397&subtasks=false&order_by=due_date&reverse=false', 
    { headers: CLICKUP_HEADERS }
  );

  const tasks = res.data.tasks || [];
  
  // Filtrar o que está 'open' ou 'custom' (ignorar done/closed)
  const activeTasks = tasks.filter(t => t.status.type !== 'done' && t.status.type !== 'closed');
  
  // Pegar as 15 primeiras (as mais atrasadas ou para hoje/amanhã)
  const topTasks = activeTasks.slice(0, 15).map(t => ({
    name: t.name,
    list: t.list.name,
    status: t.status.status,
    priority: t.priority?.priority || 'normal',
    dueDate: t.due_date ? new Date(Number(t.due_date)).toLocaleDateString('pt-BR') : 'Sem prazo'
  }));

  if (topTasks.length === 0) {
    bot.telegram.sendMessage(userId, '🌅 Bom dia! Você não tem tasks abertas no momento. Aproveite seu dia!');
    return;
  }

  // 2. Pedir pro GPT formatar uma mensagem legal de bom dia
  const prompt = `
O usuário Matheus Felipy está começando o dia. Hoje é ${new Date().toLocaleDateString('pt-BR')}.
Aqui está a lista das tarefas mais urgentes dele ativas no ClickUp:
${JSON.stringify(topTasks, null, 2)}

Sua tarefa:
Crie uma mensagem curta e amigável de "Bom dia" em HTML para o Telegram.
- Fale o dia de hoje.
- Destaque as principais tarefas que ele precisa focar (pode agrupar algumas ou só listar os destaques de forma atraente usando bullet points ou emojis).
- Não seja robótico. Seja como um assistente executivo motivador.
- Use <b> para negrito, <i> para itálico. Mantenha os links se quiser mas evite complicar.
- A mensagem deve terminar com uma palavra de motivação.
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Você é um assistente executivo de alto nível focado em produtividade.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.5,
  });

  const briefingMessage = completion.choices[0].message.content;

  // 3. Enviar no Telegram
  await bot.telegram.sendMessage(userId, briefingMessage, { parse_mode: 'HTML' });
}

module.exports = { initScheduler, sendDailyBriefing };
