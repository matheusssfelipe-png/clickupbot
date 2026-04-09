const client = require('./client');

/**
 * Listar todos os workspaces (teams) acessíveis
 */
async function getTeams() {
  const { data } = await client.get('/team');
  return data.teams;
}

/**
 * Listar spaces de um workspace
 */
async function getSpaces(teamId) {
  const { data } = await client.get(`/team/${teamId}/space?archived=false`);
  return data.spaces;
}

/**
 * Listar folders de um space
 */
async function getFolders(spaceId) {
  const { data } = await client.get(`/space/${spaceId}/folder?archived=false`);
  return data.folders;
}

/**
 * Listar lists de um space (sem folder)
 */
async function getSpaceLists(spaceId) {
  const { data } = await client.get(`/space/${spaceId}/list?archived=false`);
  return data.lists;
}

/**
 * Listar lists de um folder
 */
async function getFolderLists(folderId) {
  const { data } = await client.get(`/folder/${folderId}/list?archived=false`);
  return data.lists;
}

/**
 * Listar statuses de uma lista
 */
async function getListStatuses(listId) {
  const { data } = await client.get(`/list/${listId}`);
  return data.statuses || [];
}

module.exports = {
  getTeams,
  getSpaces,
  getFolders,
  getSpaceLists,
  getFolderLists,
  getListStatuses,
};
