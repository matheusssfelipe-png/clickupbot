/**
 * Memória de conversação por usuário
 * Armazena as últimas interações para contexto
 */
class ConversationMemory {
  constructor(maxMessages = 10) {
    this.conversations = new Map();
    this.maxMessages = maxMessages;
  }

  /**
   * Adicionar mensagem ao histórico
   */
  addMessage(userId, role, content, metadata = null) {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, []);
    }

    const history = this.conversations.get(userId);
    
    const entry = { role, content, timestamp: Date.now() };
    if (metadata) entry.metadata = metadata;
    
    history.push(entry);

    // Manter apenas as últimas N mensagens
    if (history.length > this.maxMessages) {
      history.splice(0, history.length - this.maxMessages);
    }
  }

  /**
   * Obter histórico de mensagens formatado para a OpenAI
   */
  getHistory(userId) {
    const history = this.conversations.get(userId) || [];
    return history.map(entry => ({
      role: entry.role,
      content: entry.content,
    }));
  }

  /**
   * Obter última ação executada (para contexto de follow-up)
   */
  getLastAction(userId) {
    const history = this.conversations.get(userId) || [];
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].metadata?.action) {
        return history[i].metadata;
      }
    }
    return null;
  }

  /**
   * Limpar histórico de um usuário
   */
  clear(userId) {
    this.conversations.delete(userId);
  }
}

// Instância global
const memory = new ConversationMemory();

module.exports = { memory };
