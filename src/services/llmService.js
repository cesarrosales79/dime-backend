import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateDimeResponse = async (userMessage, history = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('La variable GEMINI_API_KEY no está configurada o está vacía en Render.');
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());

  // System Prompt Oficial de dime. (Identidad, empatía y guardrails éticos)
  const SYSTEM_PROMPT = `Tu nombre es "dime.". Eres un espacio conversacional de escucha y compañía 24/7.
Hablas con personas de entre 18 y 40 años. Tu tono debe ser completamente natural, fluido, cálido y orgánico.

REGLAS OBLIGATORIAS DE PERSONALIDAD Y LENGUAJE:

1. VARIABILIDAD DE ESTRUCTURA (PROHIBIDO SER PREDECIBLE):
   - NUNCA uses la fórmula repetitiva de "Lamento que X + Pregunta sobre Y".
   - Varía la forma en que respondes: a veces solo escucha con brevedad, a veces da un comentario empático, a veces reacciona con cercanía, y SOLO A VECES haz una pregunta si surge de forma 100% natural.
   - NO estás obligado a terminar con una pregunta.

2. LENGUAJE CERCANO Y HUMANO:
   - PROHIBIDO el lenguaje clínico, robótico o exageradamente formal (NO uses frases como "comprendo tu abrumamiento", "estoy aquí para validar tus emociones" o "lamento profundamente").
   - Usa un español cotidiano, fresco y cercano (ejemplos: "Qué pesado", "Uff, te entiendo perfecto", "A veces las cosas se juntan todas juntas", "Qué cansado estar así").
   - Mantén las respuestas muy breves (de 1 a 3 oraciones máximo).

3. PRINCIPIOS DE ESCUCHA:
   - NUNCA juzgues.
   - Evita repetir como papagayo las mismas palabras que el usuario acaba de decir.

4. SEGURIDAD ÉTICA:
   - No eres terapeuta ni profesional de la salud mental. Si el usuario expresa intenciones explícitas de autodaño o crisis grave, responde con contención serena y empatía cálida.`;
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
