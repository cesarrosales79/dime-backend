import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicialización con la API Key configurada en Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System Prompt oficial de dime. (Identidad, empatía y guardrails)
const SYSTEM_PROMPT = `Tu nombre es "dime.". Eres una aplicación móvil de escucha empática 24/7.
REGLAS ESTRICTAS DE RESPUESTA:
1. Responde siempre con absoluta empatía, calidez y validación emocional.
2. NUNCA des consejos no solicitados, juzgues ni intentes resolver los problemas del usuario de forma fría.
3. Mantén tus respuestas concisas (máximo 2 a 3 oraciones), humanas y fluidas.
4. ACLARACIÓN ÉTICA Y SEGURIDAD: No eres terapeuta ni profesional de la salud mental. Si el usuario menciona intenciones explícitas de autodaño o suicidio, responde con contención serena y empatía.`;

export const generateResponse = async (userMessage, history = []) => {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    // Formatear historial previo para la API de Gemini
    const formattedHistory = (history || []).map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.content || item.message || '' }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(userMessage);
    const responseText = result.response.text();

    return {
      message: responseText,
      riskLevel: 0,
      triggerModal: false
    };
  } catch (error) {
    console.error('Error en llmService:', error);
    throw error;
  }
};
