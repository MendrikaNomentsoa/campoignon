
import Groq from 'groq-sdk';
export function createGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined');
  }
  return new Groq({
    apiKey: apiKey,
  });
}

export function getGroqModel() {
  return process.env.GROQ_MODEL || 'mixtral-8x7b-32768';
}