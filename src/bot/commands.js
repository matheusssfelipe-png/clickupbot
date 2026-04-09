const { WORKSPACES, PRIORITIES, findListByName, findFolderByName } = require('../config/constants');
const tasks = require('../clickup/tasks');
const spaces = require('../clickup/spaces');
const msg = require('./messages');

const HTML = { parse_mode: 'HTML' };

/**
 * Registrar todos os comandos no bot
 */
function registerCommands(bot) {
  // /start e /help
  bot.start((ctx) => ctx.reply(msg.welcomeMessage(), HTML));
  bot.help((ctx) => ctx.reply(msg.welcomeMessage(), HTML));

  // ─────────────────────────────────────────────
  // NAVEGAÇÃO
  // ─────────────────────────────────────────────

  // /workspaces — Listar todos os workspaces
  bot.command('workspaces', async (ctx) => {
    try {
      const teams = await spaces.getTeams();
      await ctx.reply(msg.formatWorkspaces(teams), HTML);
    } catch (err) {
      await ctx.reply(msg.errorMessage(err.message), HTML);
    }
  });

  // /spaces [workspace] — Listar spaces de um workspace
  bot.command('spaces', async (ctx) => {
    try {
      const search = getArgs(ctx);
      if (!search) {
        return ctx.reply('ℹ️ Uso: /spaces [nome do workspace]\nEx: /spaces trizos');
      }

      const ws = findWorkspace(search);
      if (!ws) {
        return ctx.reply(`❌ Workspace "${search}" não encontrado. Use /workspaces para ver os disponíveis.`);
      }

      const spaceList = await spaces.getSpaces(ws.id);
      await ctx.reply(msg.formatSpaces(spaceList, ws.name), HTML);
    } catch (err) {
      await ctx.reply(msg.errorMessage(err.message), HTML);
    }
  });

  // /lists [busca] — Buscar listas por nome
  bot.command('lists', async (ctx) => {
    try {
      const search = getArgs(ctx);
      if (!search) {
        return ctx.reply('ℹ️ Uso: /lists [busca]\nEx: /lists flame');
      }

      const results = findListByName(search);
      await ctx.reply(msg.formatListSearchResults(results), HTML);
    } catch (err) {
      await ctx.reply(msg.errorMessage(err.message), HTML);
    }
  });

  // /folders [busca] — Buscar folders por nome
  bot.command('folders', async (ctx) => {
    try {
      const search = getArgs(ctx);
      if (!search) {
        return ctx.reply('ℹ️ Uso: /folders [busca]\nEx: /folders flame');
      }

      const results = findFolderByName(search);
      if (results.length === 0) {
        return ctx.reply('❌ Nenhum folder encontrado com esse nome.');
      }

      let reply = `🔍 <b>Folders encontrados (${results.length}):</b>\n\n`;
      results.forEach((r, i) => {
        reply += `${i + 1}. 📂 <b>${msg.escapeHtml(r.folderName)}</b>\n`;
        reply += `   📁 ${msg.escapeHtml(r.workspaceName)} > ${msg.escapeHtml(r.spaceName)}\n`;
        reply += `   🆔 <code>${r.folderId}</code>\n`;
        const listNames = Object.values(r.lists || {}).map(l => l.name).join(', ');
        if (listNames) {
          reply += `   📋 Listas: ${msg.escapeHtml(listNames)}\n`;
        }
        reply += '\n';
      });
      await ctx.reply(reply, HTML);
    } catch (err) {
      await ctx.reply(msg.errorMessage(err.message), HTML);
    }
  });

  // ─────────────────────────────────────────────
  // GESTÃO DE TASKS
  // ─────────────────────────────────────────────

  // /nova [lista] | [nome da task] — Criar task
  bot.command('nova', async (ctx) => {
    try {
      const args = getArgs(ctx);
      if (!args || !args.includes('|')) {
        return ctx.reply('ℹ️ Uso: /nova [lista] | [nome da task]\nEx: /nova flame | Criar campanha de ads\nEx: /nova 901308354164 | Criar campanha');
      }

      const [listSearch, taskName] = args.split('|').map(s => s.trim());
      if (!taskName) {
        return ctx.reply('❌ Faltou o nome da task. Use: /nova [lista] | [nome]');
      }

      let listId, locationStr;

      if (/^\d+$/.test(listSearch)) {
        listId = listSearch;
        locationStr = `List ID: ${listId}`;
      } else {
        const results = findListByName(listSearch);
        if (results.length === 0) {
          return ctx.reply(`❌ Lista "${listSearch}" não encontrada. Use /lists para buscar.`);
        }
        if (results.length > 1) {
          let reply = `⚠️ Encontrei ${results.length} listas. Seja mais específico ou use o ID:\n\n`;
          results.forEach((r, i) => {
            const folder = r.folderName ? ` > ${r.folderName}` : '';
            reply += `${i + 1}. 📋 ${r.listName}\n   📁 ${r.workspaceName} > ${r.spaceName}${folder}\n   🆔 ${r.listId}\n\n`;
          });
          return ctx.reply(reply);
        }
        listId = results[0].listId;
        const folder = results[0].folderName ? ` > ${results[0].folderName}` : '';
        locationStr = `${results[0].workspaceName} > ${results[0].spaceName}${folder} > ${results[0].listName}`;
      }

      const task = await tasks.createTask(listId, { name: taskName, priority: 3 });
      await ctx.reply(msg.formatTaskCreated(task, locationStr), HTML);
    } catch (err) {
      await ctx.reply(msg.errorMessage(err.message), HTML);
    }
  });

  // /tasks [lista] — Listar tasks de uma lista
  bot.command('tasks', async (ctx) => {
    try {
      const search = getArgs(ctx);
      if (!search) {
        return ctx.reply('ℹ️ Uso: /tasks [nome da lista ou ID]\nEx: /tasks flame\nEx: /tasks 901308354164');
      }

      let listId, listName;

      if (/^\d+$/.test(search)) {
        listId = search;
        listName = `List ${listId}`;
      } else {
        const results = findListByName(search);
        if (results.length === 0) {
          return ctx.reply(`❌ Lista "${search}" não encontrada.`);
        }
        if (results.length > 1) {
          let reply = `⚠️ Encontrei ${results.length} listas. Seja mais específico:\n\n`;
          results.forEach((r, i) => {
            reply += `${i + 1}. ${r.listName} (${r.folderName || r.spaceName}) — ID: ${r.listId}\n`;
          });
          return ctx.reply(reply);
        }
        listId = results[0].listId;
        listName = results[0].listName;
      }

      const taskList = await tasks.getTasks(listId);
      
      if (taskList.length === 0) {
        return ctx.reply(`📋 <b>${msg.escapeHtml(listName)}</b>\n\n<i>Nenhuma task encontrada.</i>`, HTML);
      }

      let reply = `📋 <b>Tasks em ${msg.escapeHtml(listName)}:</b>\n\n`;
      taskList.slice(0, 20).forEach((task, i) => {
        reply += msg.formatTask(task, i) + '\n\n';
      });
      if (taskList.length > 20) {
        reply += `\n<i>...e mais ${taskList.length - 20} tasks</i>`;
      }

      await ctx.reply(reply, HTML);
    } catch (err) {
      await ctx.reply(msg.errorMessage(err.message), HTML);
    }
  });

  // /detalhes [task_id] — Ver detalhes de uma task
  bot.command('detalhes', async (ctx) => {
    try {
      const taskId = getArgs(ctx);
      if (!taskId) {
        return ctx.reply('ℹ️ Uso: /detalhes [task_id]\nEx: /detalhes abc123');
      }

      const task = await tasks.getTask(taskId.replace('#', ''));
      await ctx.reply(msg.formatTaskDetails(task), HTML);
    } catch (err) {
      await ctx.reply(msg.errorMessage(err.message), HTML);
    }
  });

  // /status [task_id] [novo status] — Mudar status
  bot.command('status', async (ctx) => {
    try {
      const args = getArgs(ctx);
      if (!args || !args.includes(' ')) {
        return ctx.reply('ℹ️ Uso: /status [task_id] [novo status]\nEx: /status abc123 in progress');
      }

      const spaceIndex = args.indexOf(' ');
      const taskId = args.substring(0, spaceIndex).replace('#', '');
      const newStatus = args.substring(spaceIndex + 1).trim();

      await tasks.updateTask(taskId, { status: newStatus });
      await ctx.reply(`✅ Status da task <code>${msg.escapeHtml(taskId)}</code> atualizado para <b>${msg.escapeHtml(newStatus)}</b>`, HTML);
    } catch (err) {
      await ctx.reply(msg.errorMessage(err.message), HTML);
    }
  });

  // /prioridade [task_id] [nivel] — Mudar prioridade
  bot.command('prioridade', async (ctx) => {
    try {
      const args = getArgs(ctx);
      if (!args || !args.includes(' ')) {
        return ctx.reply('ℹ️ Uso: /prioridade [task_id] [urgente|alta|normal|baixa]\nEx: /prioridade abc123 alta');
      }

      const spaceIndex = args.indexOf(' ');
      const taskId = args.substring(0, spaceIndex).replace('#', '');
      const level = args.substring(spaceIndex + 1).trim().toLowerCase();

      const priority = PRIORITIES[level];
      if (!priority) {
        return ctx.reply('❌ Prioridade inválida. Use: urgente, alta, normal, ou baixa');
      }

      await tasks.updateTask(taskId, { priority });
      await ctx.reply(`✅ Prioridade da task <code>${msg.escapeHtml(taskId)}</code> atualizada para <b>${msg.escapeHtml(level)}</b>`, HTML);
    } catch (err) {
      await ctx.reply(msg.errorMessage(err.message), HTML);
    }
  });

  // /comentar [task_id] [texto] — Adicionar comentário
  bot.command('comentar', async (ctx) => {
    try {
      const args = getArgs(ctx);
      if (!args || !args.includes(' ')) {
        return ctx.reply('ℹ️ Uso: /comentar [task_id] [texto]\nEx: /comentar abc123 Aprovado pelo cliente!');
      }

      const spaceIndex = args.indexOf(' ');
      const taskId = args.substring(0, spaceIndex).replace('#', '');
      const comment = args.substring(spaceIndex + 1).trim();

      await tasks.addComment(taskId, comment);
      await ctx.reply(`✅ Comentário adicionado na task <code>${msg.escapeHtml(taskId)}</code>`, HTML);
    } catch (err) {
      await ctx.reply(msg.errorMessage(err.message), HTML);
    }
  });

  // /concluir [task_id] — Marcar como concluída
  bot.command('concluir', async (ctx) => {
    try {
      const taskId = getArgs(ctx);
      if (!taskId) {
        return ctx.reply('ℹ️ Uso: /concluir [task_id]\nEx: /concluir abc123');
      }

      await tasks.updateTask(taskId.replace('#', ''), { status: 'complete' });
      await ctx.reply(`✅ Task <code>${msg.escapeHtml(taskId.replace('#', ''))}</code> marcada como concluída! 🎉`, HTML);
    } catch (err) {
      await ctx.reply(msg.errorMessage(err.message), HTML);
    }
  });

  // ─────────────────────────────────────────────
  // ATALHOS
  // ─────────────────────────────────────────────

  // /rapida [nome] — Task rápida na daily list
  bot.command('rapida', async (ctx) => {
    try {
      const taskName = getArgs(ctx);
      if (!taskName) {
        return ctx.reply('ℹ️ Uso: /rapida [nome da task]\nEx: /rapida Revisar relatório mensal');
      }

      const dailyListId = '900702078756'; // task list of each day
      const task = await tasks.createTask(dailyListId, { name: taskName, priority: 3 });
      await ctx.reply(msg.formatTaskCreated(task, 'TRIZOS CO. > LIFE MANAGEMENT > Work > task list of each day'), HTML);
    } catch (err) {
      await ctx.reply(msg.errorMessage(err.message), HTML);
    }
  });

  // /buscar [nome] — Buscar task por nome nos workspaces
  bot.command('buscar', async (ctx) => {
    try {
      const search = getArgs(ctx);
      if (!search) {
        return ctx.reply('ℹ️ Uso: /buscar [nome da task]\nEx: /buscar campanha');
      }

      const found = await tasks.searchTasks('9007019902', search);
      
      if (found.length === 0) {
        return ctx.reply(`🔍 Nenhuma task encontrada com "${search}".`);
      }

      let reply = `🔍 <b>Tasks encontradas (${Math.min(found.length, 10)}):</b>\n\n`;
      found.slice(0, 10).forEach((task, i) => {
        reply += msg.formatTask(task, i) + '\n\n';
      });

      await ctx.reply(reply, HTML);
    } catch (err) {
      await ctx.reply(msg.errorMessage(err.message), HTML);
    }
  });

  // /myid — Helper para descobrir o user ID do Telegram
  bot.command('myid', (ctx) => {
    ctx.reply(`🆔 Seu User ID do Telegram: <code>${ctx.from.id}</code>\n\nCopie esse número e coloque no .env como TELEGRAM_ALLOWED_USER_ID`, HTML);
  });
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getArgs(ctx) {
  const text = ctx.message?.text || '';
  const match = text.match(/^\/\w+\s+(.*)/s);
  return match ? match[1].trim() : '';
}

function findWorkspace(search) {
  const s = search.toLowerCase();
  for (const [key, ws] of Object.entries(WORKSPACES)) {
    if (key.includes(s) || ws.name.toLowerCase().includes(s)) {
      return ws;
    }
  }
  return null;
}

module.exports = { registerCommands };
