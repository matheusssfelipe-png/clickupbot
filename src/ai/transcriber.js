const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Transcrever áudio para texto usando Whisper
 * @param {string} filePath - Caminho do arquivo de áudio (OGG)
 * @returns {string} Texto transcrito
 */
async function transcribeAudio(filePath) {
  const transcription = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: fs.createReadStream(filePath),
    language: 'pt',
    response_format: 'text',
  });

  return transcription.trim();
}

module.exports = { transcribeAudio };
