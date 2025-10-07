import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import dsntRouter from './routes/dsnt.route.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// keep logs clean—never log secrets/tokens
app.use(
  morgan(':method :url :status :response-time ms', {
    skip: (req) =>
      req.url.toLowerCase().includes('password') ||
      req.url.toLowerCase().includes('authorization') ||
      req.url.toLowerCase().includes('token'),
  })
);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/dsnt', dsntRouter);

// minimal centralized error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err?.status ?? err?.response?.status ?? 500;
  const message = err?.message || err?.response?.data?.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

export default app;
