import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateDimeResponse = async (userMessage, history = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('La variable GEMINI_API_KEY no está configurada o está vacía en Render.');
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());

  // System Prompt Oficial de dime. (Identidad, empatía y guardrails éticos)
  const SYSTEM_PROMPT = `Tu nombre es "dime.". Eres un espacio conversacional de escucha empática 24/7.
REGLAS ESTRICTAS DE RESPUESTA:
1. Responde siempre con absoluta empatía, calidez humana y validación emocional activa.
2. NUNCA des consejos no solicitados, juzgues, ni dictes soluciones frías.
3. Mantén tus respuestas concisas (máximo 2 a 3 oraciones), cercanas y fluidas.
4. ACLARACIÓN ÉTICA Y SEGURIDAD: NO eres terapeuta ni profesional médico. Si el usuario expresa intenciones explícitas de autodaño o crisis severa, responde con contención serena, empatía y apertura.`;

  // Modelos candidatos en orden de preferencia según tu proyecto activo en Google AI Studio
  const candidateModels = [
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-1.5-flash'
  ];

  const formattedHistory = (history || [])
    .filter(item => item && (item.content || item.message))
    .map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.content || item.message }]
    }));

  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
      });

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(userMessage);
      const responseText = result.response.text();

      console.log(`[dime. Engine] Respuesta generada exitosamente con: ${modelName}`);

      return {
        message: responseText,
        riskLevel: 0,
        triggerModal: false
      };
    } catch (error) {
      console.warn(`[dime. Engine] Intento con '${modelName}' no completado:`, error.message);
      lastError = error;
    }
  }

  throw new Error(`Gemini API Error: ${lastError?.message || lastError}`);
};

export const generateResponse = generateDimeResponse;
