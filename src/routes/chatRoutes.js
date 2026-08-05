import { Router } from 'express';
import { handleChatMessage } from '../controllers/chatController.js';

const router = Router();

// Endpoint POST para el envío de mensajes desde la app
router.post('/message', handleChatMessage);

export default router;
