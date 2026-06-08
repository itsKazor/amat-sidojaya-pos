import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import categoryRouter from './routes/categories.js';
import productRouter from './routes/products.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API endpoints
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'OK', message: 'Sistem Amat Sidojaya API is online.' });
});

// Serve static files from Vite build in production
const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Amat Sidojaya Backend Development Server');
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (Mode: ${isProd ? 'Production' : 'Development'})`);
});
