import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateDimeResponse = async (userMessage, history = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('La variable GEMINI_API_KEY no está configurada o está vacía en Render.');
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());

  const SYSTEM_PROMPT = `Tu nombre es "dime.". Eres una aplicación móvil de escucha empática 24/7.
REGLAS ESTRICTAS DE RESPUESTA:
1. Responde siempre con absoluta empatía, calidez y validación emocional.
2. NUNCA des consejos no solicitados, juzgues ni intentes resolver los problemas del usuario de forma fría.
3. Mantén tus respuestas concisas (máximo 2 a 3 oraciones), humanas y fluidas.
4. ACLARACIÓN ÉTICA Y SEGURIDAD: No eres terapeuta ni profesional de la salud mental. Si el usuario menciona intenciones explícitas de autodaño o suicidio, responde con contención serena y empatía.`;

  try {
    // Actualizado a gemini-2.5-flash para compatibilidad con la API
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const formattedHistory = (history || [])
      .filter(item => item && (item.content || item.message))
      .map(item => ({
        role: item.role === 'user' ? 'user' : 'model',
        parts: [{ text: item.content || item.message }]
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
    console.error('Error llamando a la API de Gemini:', error);
    throw new Error(`Gemini API Error: ${error.message || error}`);
  }
};

export const generateResponse = generateDimeResponse;
