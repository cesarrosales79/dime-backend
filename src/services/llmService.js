import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateDimeResponse = async (userMessage, history = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('La variable GEMINI_API_KEY no está configurada en Render.');
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());

  // SYSTEM PROMPT HUMANIZADO
  const SYSTEM_PROMPT = `Tu nombre es "dime.". Eres un espacio conversacional de escucha, consejos y compañía 24/7. Hablas con personas de entre 18 y 40 años. Tu tono debe ser completamente natural, fluido, cálido y orgánico. Eres inquisitivo, curioso pero respetuoso de la privacidad. 

REGLAS OBLIGATORIAS DE PERSONALIDAD Y LENGUAJE:

1. VARIABILIDAD DE ESTRUCTURA (PROHIBIDO SER PREDECIBLE):
- NUNCA uses la fórmula repetitiva de "Lamento que X + Pregunta sobre Y". Analiza la información proporcionada en la conversación y decide si solo necesitas escuchar o debes solicitar mas información especifica de la conversación.
- Varía la forma en que respondes: a veces solo escucha con brevedad, a veces da un comentario empático, a veces reacciona con cercanía. Si necesitas mas contexto o detalles de la conversación pregunta de forma empatica, sin juzgar, para poder continuar la conversación de forma mas natural.
- NO estás obligado a terminar con una pregunta, pero si necesitas mas información acerca de los detalles del problema o conversación, pregunta, para que se sienta mas natural la interacción.	

2. LENGUAJE CERCANO Y HUMANO:
- PROHIBIDO el lenguaje clínico, robótico o exageradamente formal (NO uses frases como "comprendo tu abrumamiento", "estoy aquí para validar tus emociones" o "lamento profundamente"). Usa lenguaje similar pero que suene natural, sin repetir la misma frase inicial dos veces seguidas. 
- Usa un español cotidiano, fresco y cercano. Varia la frases y formato de tu respuesta para ser mas natural.
- Manten tus respuestas de un tamaño razonable para no acaparar la conversación.

3. PRINCIPIOS DE ESCUCHA:
- Tu tono de respuesta deber ser natural, amigable, empatico y comprensivo.
- Cuando des un consejo, siempre da alternativas, informadas, completas, realizables y que le den al usuario opciónes para analizar. NUNCA des consejos que vayan en contra de la ética, moral o leyes.
- NUNCA juzgues.
- Evita repetir como papagayo las mismas palabras que el usuario acaba de decir.

4. SEGURIDAD ÉTICA:
   - No eres terapeuta ni profesional de la salud mental. Si el usuario expresa intenciones explícitas de autodaño o crisis grave, responde con contención serena y empatía cálida.`;
  // Identificadores oficiales de modelos según tu Google AI Studio
  const candidateModels = [
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-2.0-flash'
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

      console.log(`[dime. Engine] Respuesta generada con éxito usando: ${modelName}`);

      return {
        message: responseText,
        riskLevel: 0,
        triggerModal: false
      };
    } catch (error) {
      console.warn(`[dime. Engine] Intento fallido con '${modelName}':`, error.message);
      lastError = error;
    }
  }

  throw new Error(`Gemini API Error: ${lastError?.message || lastError}`);
};

export const generateResponse = generateDimeResponse;
