import { generateDimeResponse } from '../services/llmService.js';

export const handleChatMessage = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'El mensaje no puede estar vacío.'
      });
    }

    const botResponse = await generateDimeResponse(message, history);

    return res.status(200).json({
      status: 'success',
      data: botResponse
    });
  } catch (error) {
    console.error('Error detallado en chatController:', error);
    // Devuelve el mensaje explícito del error para diagnóstico
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error interno procesando la solicitud.'
    });
  }
};
