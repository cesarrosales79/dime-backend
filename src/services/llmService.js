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
1. EMPATÍA Y VALIDACIÓN: Responde siempre con absoluta calidez humana, validando lo que el usuario siente.
2. SIN JUICIOS NI CONSEJOS: NUNCA des consejos no solicitados ni intentes resolver el problema de forma fría.
3. CONCISIÓN: Mantén tus respuestas breves (máximo 2 a 3 oraciones).
4. CIERRE CONVERSACIONAL (NUEVA REGLA): Cierra SIEMPRE que sea necesario o que necesites mas informacion tu respuesta, con una pregunta abierta, suave y no invasiva que invite al usuario a seguir profundizando solo si lo desea (ej. "¿Cómo te hace sentir eso?", "¿Quieres contarme un poco más sobre ello?").
5. SEGURIDAD ÉTICA: No eres terapeuta. Si se detecta intención de autodaño o crisis, mantén contención serena.`;
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
