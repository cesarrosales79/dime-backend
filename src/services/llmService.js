import { GoogleGenAI, Type } from '@google/genai';
import { DIME_SYSTEM_PROMPT } from '../config/systemPrompt.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Esquema estructurado para forzar la respuesta JSON de la API
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    message: {
      type: Type.STRING,
      description: "Respuesta empática y concisa dirigida al usuario."
    },
    risk_level: {
      type: Type.INTEGER,
      description: "Nivel de riesgo detectado: 0 (Normal), 1 (Vulnerabilidad), 2 (Crisis Severa)."
    },
    trigger_modal: {
      type: Type.BOOLEAN,
      description: "True únicamente si risk_level es 2 y se debe abrir el modal de crisis."
    }
  },
  required: ["message", "risk_level", "trigger_modal"]
};

export const generateDimeResponse = async (userMessage, history = []) => {
  try {
    // Convertimos el historial previo al formato esperado por el SDK
    const formattedHistory = history.map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: DIME_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    const resultText = response.text;
    return JSON.parse(resultText);

  } catch (error) {
    console.error("Error en servicio LLM:", error);
    // Fallback seguro en caso de fallo técnico
    return {
      message: "Estoy teniendo un pequeño problema técnico en este momento, pero sigo aquí para ti. ¿Podrías repetirme eso?",
      risk_level: 0,
      trigger_modal: false
    };
  }
};
