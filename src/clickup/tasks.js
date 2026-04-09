const client = require('./client');

/**
 * Criar uma nova task em uma lista
 */
async function createTask(listId, { name, description, priority, dueDate, startDate, assignees, status }) {
  const body = { name };
  
  if (description) body.description = description;
  if (priority) body.priority = priority;
  if (dueDate) body.due_date = dueDate;
  if (startDate) body.start_date = startDate;
  if (assignees) body.assignees = assignees;
  if (status) body.status = status;

  const { data } = await client.post(`/list/${listId}/task`, body);
  return data;
}

/**
 * Buscar tasks de uma lista
 */
async function getTasks(listId, { page = 0, subtasks = false, statuses = [], orderBy = 'created', reverse = true } = {}) {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('subtasks', subtasks);
  params.append('order_by', orderBy);
  params.append('reverse', reverse);
  statuses.forEach(s => params.append('statuses[]', s));

  const { data } = await client.get(`/list/${listId}/task?${params.toString()}`);
  return data.tasks;
}

/**
 * Buscar detalhes de uma task pelo ID
 */
async function getTask(taskId) {
  const { data } = await client.get(`/task/${taskId}`);
  return data;
}

/**
 * Atualizar uma task
 */
async function updateTask(taskId, updates) {
  const { data } = await client.put(`/task/${taskId}`, updates);
  return data;
}

/**
 * Adicionar comentário a uma task
 */
async function addComment(taskId, commentText) {
  const { data } = await client.post(`/task/${taskId}/comment`, {
    comment_text: commentText,
  });
  return data;
}

/**
 * Deletar uma task
 */
async function deleteTask(taskId) {
  const { data } = await client.delete(`/task/${taskId}`);
  return data;
}

/**
 * Buscar tasks com filtro de data (para /hoje e /atrasadas)
 */
async function getTasksByDate(listId, { dueDateGt, dueDateLt } = {}) {
  const params = new URLSearchParams();
  if (dueDateGt) params.append('due_date_gt', dueDateGt);
  if (dueDateLt) params.append('due_date_lt', dueDateLt);
  params.append('subtasks', false);

  const { data } = await client.get(`/list/${listId}/task?${params.toString()}`);
  return data.tasks;
}

/**
 * Buscar task por nome (pesquisa no workspace inteiro)
 */
async function searchTasks(teamId, taskName) {
  const { data } = await client.get(`/team/${teamId}/task?name=${encodeURIComponent(taskName)}&subtasks=false&page=0`);
  return data.tasks || [];
}

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  addComment,
  deleteTask,
  getTasksByDate,
  searchTasks,
};
