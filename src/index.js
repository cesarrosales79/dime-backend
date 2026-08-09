import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chatRoutes.js';

const app = express();

// Permite que la app móvil y web se conecten desde cualquier origen (CORS)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Endpoint de prueba de vida
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', app: 'dime. API Service' });
});

// Rutas de la API para el chat
app.use('/api/v1/chat', chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor dime. activo en el puerto ${PORT}`);
});
