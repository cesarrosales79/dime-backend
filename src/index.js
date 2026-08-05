import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', app: 'dime. API Service' });
});

// Rutas de la API
app.use('/api/v1/chat', chatRoutes);

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de "dime." corriendo en el puerto ${PORT}`);
});
