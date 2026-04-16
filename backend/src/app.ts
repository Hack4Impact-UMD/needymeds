import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import appleWalletRouter from './routes/applewallet.route';
import dsntRouter from './routes/dsnt.route';
import googleWalletRouter from './routes/googleWallet.route';
import scriptSaveRouter from './routes/scriptsave.route';
import urlRouter from './routes/urlapi.route';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => res.status(200).json({ ok: true, route: 'root' }));
app.get('/test', (_req, res) => res.status(200).json({ ok: true, route: 'root' }));

app.use('/api/dsnt', dsntRouter);
app.use('/api/scriptsave', scriptSaveRouter);
app.use('/api/urlapi', urlRouter);
app.use('/api/wallet', googleWalletRouter);
app.use('/api/applewallet', appleWalletRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err?.status ?? err?.response?.status ?? 500;
  const message =
    err?.response?.Message ||
    err?.response?.message ||
    err?.response?.data?.Message ||
    err?.response?.data?.message ||
    err?.message ||
    'Internal Server Error';
  res.status(status).json({ ok: false, error: message });
});

export default app;
