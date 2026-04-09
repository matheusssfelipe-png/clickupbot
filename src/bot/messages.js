const { PRIORITY_LABELS } = require('../config/constants');

/**
 * Formatar mensagem de boas-vindas
 */
function welcomeMessage() {
  return `🤖 <b>ClickUp Bot — Trizos Co.</b>

Olá! Eu sou seu assistente para gerenciar o ClickUp pelo Telegram.

📋 <b>Comandos Disponíveis:</b>

<b>Navegação:</b>
/workspaces — Listar workspaces
/spaces [workspace] — Listar spaces
/lists [busca] — Buscar listas por nome
/folders [busca] — Buscar folders por nome

<b>Gestão de Tasks:</b>
/nova [lista] | [nome da task] — Criar task
/tasks [lista] — Listar tasks 
/detalhes [task_id] — Ver detalhes
/status [task_id] [novo status] — Mudar status
/prioridade [task_id] [nivel] — Mudar prioridade
/comentar [task_id] [texto] — Comentar
/concluir [task_id] — Marcar como concluída

<b>Atalhos:</b>
/rapida [nome] — Task rápida na daily list
/buscar [nome] — Buscar task por nome

<b>🎤 Comando de Voz:</b>
Envie um <b>áudio</b> com seu comando em linguagem natural!
Ex: "Criar uma tarefa na lista Flame com o nome revisar criativos"

/help — Ver esta mensagem novamente`;
}

/**
 * Formatar task para exibição
 */
function formatTask(task, index) {
  const priority = task.priority ? (PRIORITY_LABELS[task.priority.id] || '⚪') : '⚪';
  const statusEmoji = getStatusEmoji(task.status?.status);
  const name = escapeHtml(task.name);
  const id = task.id;
  const dueStr = task.due_date
    ? `📅 ${new Date(parseInt(task.due_date)).toLocaleDateString('pt-BR')}`
    : '';

  let msg = `${index != null ? `<b>${index + 1}.</b> ` : ''}${statusEmoji} ${name}\n`;
  msg += `   🆔 <code>${id}</code>`;
  if (dueStr) msg += ` ${dueStr}`;
  msg += ` ${priority}`;

  return msg;
}

/**
 * Formatar detalhes completos de uma task
 */
function formatTaskDetails(task) {
  const priority = task.priority ? (PRIORITY_LABELS[task.priority.id] || '⚪ Sem prioridade') : '⚪ Sem prioridade';
  const statusEmoji = getStatusEmoji(task.status?.status);
  const status = escapeHtml(task.status?.status || 'Sem status');
  const name = escapeHtml(task.name);
  const desc = task.description ? escapeHtml(task.description.substring(0, 500)) : '<i>Sem descrição</i>';
  const dueStr = task.due_date
    ? new Date(parseInt(task.due_date)).toLocaleDateString('pt-BR')
    : 'Sem data';
  const url = task.url || '';
  const assignees = task.assignees?.map(a => escapeHtml(a.username)).join(', ') || 'Ninguém';

  return `📋 <b>${name}</b>

${statusEmoji} <b>Status:</b> ${status}
${priority}
👤 <b>Responsável:</b> ${assignees}
📅 <b>Prazo:</b> ${dueStr}

📝 <b>Descrição:</b>
${desc}

🔗 <a href="${url}">Abrir no ClickUp</a>`;
}

/**
 * Formatar mensagem de task criada
 */
function formatTaskCreated(task, location) {
  const name = escapeHtml(task.name);
  const url = task.url || '';
  const loc = escapeHtml(location || '');

  return `✅ <b>Task criada com sucesso!</b>

📋 <b>${name}</b>
📁 ${loc}
🔵 Prioridade: Normal

🔗 <a href="${url}">Abrir no ClickUp</a>`;
}

/**
 * Formatar lista de workspaces
 */
function formatWorkspaces(teams) {
  let msg = '🏢 <b>Seus Workspaces:</b>\n\n';
  teams.forEach((t, i) => {
    msg += `${i + 1}. <b>${escapeHtml(t.name)}</b>\n`;
    msg += `   🆔 <code>${t.id}</code>\n`;
    msg += `   👥 ${t.members?.length || 0} membros\n\n`;
  });
  return msg;
}

/**
 * Formatar lista de spaces
 */
function formatSpaces(spaces, workspaceName) {
  let msg = `🗂 <b>Spaces em ${escapeHtml(workspaceName)}:</b>\n\n`;
  spaces.forEach((s, i) => {
    msg += `${i + 1}. <b>${escapeHtml(s.name)}</b>\n`;
    msg += `   🆔 <code>${s.id}</code>\n\n`;
  });
  return msg;
}

/**
 * Formatar resultado de busca de listas
 */
function formatListSearchResults(results) {
  if (results.length === 0) {
    return '❌ Nenhuma lista encontrada com esse nome.';
  }

  let msg = `🔍 <b>Listas encontradas (${results.length}):</b>\n\n`;
  results.forEach((r, i) => {
    const folder = r.folderName ? ` > ${escapeHtml(r.folderName)}` : '';
    msg += `${i + 1}. 📋 <b>${escapeHtml(r.listName)}</b>\n`;
    msg += `   📁 ${escapeHtml(r.workspaceName)} > ${escapeHtml(r.spaceName)}${folder}\n`;
    msg += `   🆔 <code>${r.listId}</code>\n\n`;
  });
  return msg;
}

/**
 * Mensagem de erro
 */
function errorMessage(error) {
  return `❌ <b>Erro:</b> ${escapeHtml(error)}`;
}

// Helpers
function getStatusEmoji(status) {
  if (!status) return '⚪';
  const s = status.toLowerCase();
  if (s.includes('complete') || s.includes('done') || s.includes('conclu') || s.includes('closed')) return '✅';
  if (s.includes('progress') || s.includes('doing') || s.includes('andamento')) return '🔄';
  if (s.includes('review') || s.includes('revisão') || s.includes('revis')) return '👁';
  if (s.includes('todo') || s.includes('to do') || s.includes('aberto') || s.includes('open')) return '📌';
  if (s.includes('block') || s.includes('bloqueado')) return '🚫';
  return '⚪';
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = {
  welcomeMessage,
  formatTask,
  formatTaskDetails,
  formatTaskCreated,
  formatWorkspaces,
  formatSpaces,
  formatListSearchResults,
  errorMessage,
  escapeHtml,
};
