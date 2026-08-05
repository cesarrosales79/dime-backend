import { generateDimeResponse } from '../services/llmService.js';

export const handleChatMessage = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        error: "El parámetro 'message' es requerido y no puede estar vacío."
      });
    }

    const aiResponse = await generateDimeResponse(message, history || []);

    return res.status(200).json({
      status: "success",
      data: aiResponse
    });

  } catch (error) {
    console.error("Error en ChatController:", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno procesando la solicitud."
    });
  }
};
