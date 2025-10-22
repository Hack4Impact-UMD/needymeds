import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import dsntRouter from './routes/dsnt.route';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// (Logging middleware removed for simplicity & to avoid adding extra deps during merge)

app.get('/health', (_req, res) => res.json({ ok: true }));
// Legacy root ping for tests
app.get('/', (_req, res) => res.status(200).json({ ok: true, route: 'root' }));

// New preferred base path
app.use('/api/dsnt', dsntRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err?.status ?? err?.response?.status ?? 500;
  const message = err?.message || err?.response?.data?.message || 'Internal Server Error';
  res.status(status).json({ ok: false, error: message });
});

export default app;
