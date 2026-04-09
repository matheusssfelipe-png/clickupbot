const fs = require('fs');
const path = require('path');
const https = require('https');
const { transcribeAudio } = require('../ai/transcriber');
const { interpretCommand } = require('../ai/interpreter');
const { memory } = require('../ai/memory');
const tasks = require('../clickup/tasks');
const spaces = require('../clickup/spaces');
const msg = require('./messages');
const { WORKSPACES } = require('../config/constants');

const HTML = { parse_mode: 'HTML' };

// Diretório temporário para áudios
const TEMP_DIR = path.join(__dirname, '..', '..', 'temp');

/**
 * Registrar handlers de voz e texto inteligente
 */
function registerVoiceHandler(bot) {
  // Handler para mensagens de voz
  bot.on('voice', handleVoice);
  bot.on('audio', handleVoice);
}

/**
 * Registrar handler de texto inteligente (conversa livre com IA)
 */
function registerTextAIHandler(bot) {
  bot.on('text', handleText);
}

// ─────────────────────────────────────────────
// HANDLER DE VOZ
// ─────────────────────────────────────────────

async function handleVoice(ctx) {
  let tempFile = null;
  
  try {
    const processingMsg = await ctx.reply('🎤 Processando seu áudio...');
    const userId = ctx.from.id;

    // 1. Baixar o arquivo de áudio
    const fileId = ctx.message.voice?.file_id || ctx.message.audio?.file_id;
    if (!fileId) {
      return ctx.reply('❌ Não consegui acessar o áudio.');
    }

    const file = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    tempFile = path.join(TEMP_DIR, `voice_${Date.now()}.ogg`);
    await downloadFile(fileUrl, tempFile);

    // 2. Transcrever
    await ctx.telegram.editMessageText(
      ctx.chat.id, processingMsg.message_id, null,
      '🎤 Transcrevendo áudio...'
    );

    const transcription = await transcribeAudio(tempFile);
    console.log(`🎤 Transcrição: "${transcription}"`);

    // 3. Interpretar com contexto de conversação
    await ctx.telegram.editMessageText(
      ctx.chat.id, processingMsg.message_id, null,
      `🎤 <i>"${msg.escapeHtml(transcription)}"</i>\n\n🧠 Interpretando...`,
      HTML
    );

    const history = memory.getHistory(userId);
    const action = await interpretCommand(transcription, history);
    console.log(`🧠 Ação:`, JSON.stringify(action));

    // 4. Executar
    await ctx.telegram.editMessageText(
      ctx.chat.id, processingMsg.message_id, null,
      `🎤 <i>"${msg.escapeHtml(transcription)}"</i>\n\n⚡ Executando...`,
      HTML
    );

    const result = await executeAction(action, ctx);

    // 5. Salvar no histórico
    memory.addMessage(userId, 'user', transcription);
    memory.addMessage(userId, 'assistant', `Ação executada: ${JSON.stringify(action)}`, action);

    // 6. Responder
    await ctx.telegram.editMessageText(
      ctx.chat.id, processingMsg.message_id, null,
      `🎤 <i>"${msg.escapeHtml(transcription)}"</i>\n\n${result}`,
      { ...HTML, disable_web_page_preview: true }
    );

  } catch (err) {
    console.error('❌ Erro no voice handler:', err);
    await ctx.reply(`❌ Erro ao processar áudio: ${err.message}`);
  } finally {
    if (tempFile && fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

// ─────────────────────────────────────────────
// HANDLER DE TEXTO INTELIGENTE
// ─────────────────────────────────────────────

async function handleText(ctx) {
  const text = ctx.message?.text || '';
  
  // Ignorar comandos com / (esses são tratados pelo commands.js)
  if (text.startsWith('/')) return;

  try {
    const userId = ctx.from.id;
    const processingMsg = await ctx.reply('🧠 Pensando...');

    // Interpretar com contexto
    const history = memory.getHistory(userId);
    const action = await interpretCommand(text, history);
    console.log(`💬 Texto: "${text}" → Ação:`, JSON.stringify(action));

    // Executar
    const result = await executeAction(action, ctx);

    // Salvar no histórico
    memory.addMessage(userId, 'user', text);
    memory.addMessage(userId, 'assistant', `Ação executada: ${JSON.stringify(action)}`, action);

    // Responder
    await ctx.telegram.editMessageText(
      ctx.chat.id, processingMsg.message_id, null,
      result,
      { ...HTML, disable_web_page_preview: true }
    );

  } catch (err) {
    console.error('❌ Erro no text handler:', err);
    await ctx.reply(`❌ Erro: ${err.message}`);
  }
}

// ─────────────────────────────────────────────
// EXECUTOR DE AÇÕES
// ─────────────────────────────────────────────

async function executeAction(action, ctx) {
  const userId = ctx.from.id;

  switch (action.action) {
    case 'criar_task': {
      if (!action.list_id || !action.name) {
        return '❌ Não consegui identificar a lista ou o nome da task.';
      }
      let finalStatus = action.status;
      if (finalStatus === 'status') {
         finalStatus = undefined;
      }

      const task = await tasks.createTask(action.list_id, {
        name: action.name,
        description: action.description || '',
        priority: action.priority || 3,
        status: finalStatus,
        assignees: action.assignees || [55057397],
        startDate: action.start_date || undefined,
        dueDate: action.due_date || undefined
      });
      const url = task.url || '';
      const statusStr = task.status?.status ? `\n⚪ <b>Status:</b> ${msg.escapeHtml(task.status.status)}` : '';
      const assigneeStr = task.assignees?.length ? `\n👤 <b>Responsável:</b> ${task.assignees.map(a => msg.escapeHtml(a.username)).join(', ')}` : '';
      const startStr = task.start_date ? `\n📅 <b>Início:</b> ${new Date(Number(task.start_date)).toLocaleDateString('pt-BR')}` : '';
      const dueStr = task.due_date ? `\n⏳ <b>Prazo:</b> ${new Date(Number(task.due_date)).toLocaleDateString('pt-BR')}` : '';
      const descPreview = action.description ? '\n📝 Descrição incluída ✓' : '';

      // Salvar task_id no contexto para follow-ups
      action.created_task_id = task.id;
      action.created_task_name = task.name;

      return `✅ <b>Task criada!</b>\n\n📋 <b>${msg.escapeHtml(task.name)}</b>${statusStr}${assigneeStr}${startStr}${dueStr}${descPreview}\n🆔 <code>${task.id}</code>\n🔗 <a href="${url}">Abrir no ClickUp</a>`;
    }

    case 'mover_task': {
      let taskId = action.task_id;
      
      // Se não tem task_id, tentar pegar do contexto anterior
      if (!taskId) {
        const lastAction = memory.getLastAction(userId);
        taskId = lastAction?.created_task_id || lastAction?.task_id;
      }

      if (!taskId || !action.list_id) {
        return '❌ Não consegui identificar a task ou a lista destino. Me diz o ID da task e para qual lista quer mover.';
      }

      try {
        const client = require('../clickup/client');
        
        // 1. Obter a task antiga
        const getRes = await client.get(`/task/${taskId}`);
        const oldTask = getRes.data;

        // 2. Criar uma cópia na nova lista
        const newRes = await client.post(`/list/${action.list_id}/task`, {
          name: oldTask.name,
          description: oldTask.description,
          priority: oldTask.priority?.priority || 3,
          status: oldTask.status?.status || undefined,
          assignees: oldTask.assignees?.map(a => a.id) || []
        });
        
        // 3. Deletar a task antiga (mover)
        await client.delete(`/task/${taskId}`);
        
        // Atualizar o contexto
        action.created_task_id = newRes.data.id;
        
        return `✅ <b>Task movida com sucesso!</b>\n\n🆔 <code>${newRes.data.id}</code> (Nova lista: <code>${action.list_id}</code>)\n🔗 <a href="${newRes.data.url}">Abrir no ClickUp</a>`;
      } catch (err) {
        console.error('Erro ao mover task:', err.response?.data || err.message);
        return '❌ Falha ao mover. A API do ClickUp V2 não permite mover entre certos spaces, tente criar direto na lista correta.';
      }
    }

    case 'deletar_task': {
      let taskId = action.task_id;
      
      if (!taskId) {
        const lastAction = memory.getLastAction(userId);
        taskId = lastAction?.created_task_id || lastAction?.task_id;
      }

      if (!taskId) {
        // Tentar buscar pelo nome
        if (action.task_name) {
          const found = await tasks.searchTasks('9007019902', action.task_name);
          if (found.length > 0) taskId = found[0].id;
        }
      }

      if (!taskId) {
        return '❌ Não consegui identificar qual task deletar.';
      }

      await tasks.deleteTask(taskId);
      return `🗑 <b>Task deletada!</b>\n\n🆔 <code>${taskId}</code>`;
    }

    case 'listar_tasks': {
      if (!action.list_id) {
        return '❌ Não consegui identificar a lista.';
      }
      const taskList = await tasks.getTasks(action.list_id);
      if (taskList.length === 0) {
        return '📋 <i>Nenhuma task encontrada nessa lista.</i>';
      }
      let reply = `📋 <b>Tasks encontradas (${taskList.length}):</b>\n\n`;
      taskList.slice(0, 15).forEach((task, i) => {
        reply += msg.formatTask(task, i) + '\n\n';
      });
      return reply;
    }

    case 'buscar_task': {
      if (!action.query) {
        return '❌ Não consegui identificar o que buscar.';
      }
      const found = await tasks.searchTasks('9007019902', action.query);
      if (found.length === 0) {
        return `🔍 Nenhuma task encontrada com "${msg.escapeHtml(action.query)}".`;
      }
      let reply = `🔍 <b>Tasks encontradas:</b>\n\n`;
      found.slice(0, 10).forEach((task, i) => {
        reply += msg.formatTask(task, i) + '\n\n';
      });
      return reply;
    }

    case 'concluir_task': {
      let taskId = action.task_id;
      
      if (!taskId && action.task_name) {
        const found = await tasks.searchTasks('9007019902', action.task_name);
        if (found.length === 0) {
          return `❌ Task "${msg.escapeHtml(action.task_name)}" não encontrada.`;
        }
        taskId = found[0].id;
        action.task_name = found[0].name;
      }
      
      if (!taskId) {
        const lastAction = memory.getLastAction(userId);
        taskId = lastAction?.created_task_id;
      }

      if (!taskId) return '❌ Não consegui identificar a task.';

      await tasks.updateTask(taskId, { status: 'complete' });
      return `✅ Task <b>${msg.escapeHtml(action.task_name || taskId)}</b> marcada como concluída! 🎉`;
    }

    case 'mudar_status': {
      if (!action.task_name || !action.status) {
        return '❌ Não consegui identificar a task ou o novo status.';
      }
      const found = await tasks.searchTasks('9007019902', action.task_name);
      if (found.length === 0) {
        return `❌ Task "${msg.escapeHtml(action.task_name)}" não encontrada.`;
      }
      await tasks.updateTask(found[0].id, { status: action.status });
      return `✅ Status de <b>${msg.escapeHtml(found[0].name)}</b> atualizado para <b>${msg.escapeHtml(action.status)}</b>`;
    }

    case 'mudar_prioridade': {
      if (!action.task_name || !action.priority) {
        return '❌ Não consegui identificar a task ou a prioridade.';
      }
      const found = await tasks.searchTasks('9007019902', action.task_name);
      if (found.length === 0) {
        return `❌ Task "${msg.escapeHtml(action.task_name)}" não encontrada.`;
      }
      await tasks.updateTask(found[0].id, { priority: action.priority });
      const labels = { 1: 'Urgente', 2: 'Alta', 3: 'Normal', 4: 'Baixa' };
      return `✅ Prioridade de <b>${msg.escapeHtml(found[0].name)}</b> atualizada para <b>${labels[action.priority] || action.priority}</b>`;
    }

    case 'comentar': {
      if (!action.task_name || !action.comment) {
        return '❌ Não consegui identificar a task ou o comentário.';
      }
      const found = await tasks.searchTasks('9007019902', action.task_name);
      if (found.length === 0) {
        return `❌ Task "${msg.escapeHtml(action.task_name)}" não encontrada.`;
      }
      await tasks.addComment(found[0].id, action.comment);
      return `✅ Comentário adicionado em <b>${msg.escapeHtml(found[0].name)}</b>`;
    }

    case 'listar_workspaces': {
      const teams = await spaces.getTeams();
      return msg.formatWorkspaces(teams);
    }

    case 'listar_spaces': {
      const wsName = (action.workspace || '').toLowerCase();
      let wsId = null;
      for (const [key, ws] of Object.entries(WORKSPACES)) {
        if (key.includes(wsName) || ws.name.toLowerCase().includes(wsName)) {
          wsId = ws.id;
          break;
        }
      }
      if (!wsId) {
        return `❌ Workspace "${msg.escapeHtml(action.workspace)}" não encontrado.`;
      }
      const spaceList = await spaces.getSpaces(wsId);
      return msg.formatSpaces(spaceList, action.workspace);
    }

    case 'resposta': {
      return `💬 ${action.message || 'Estou aqui para ajudar!'}`;
    }

    case 'desconhecido':
    default:
      return `🤔 ${msg.escapeHtml(action.message || 'Não entendi. Pode reformular?')}`;
  }
}

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

module.exports = { registerVoiceHandler, registerTextAIHandler };
