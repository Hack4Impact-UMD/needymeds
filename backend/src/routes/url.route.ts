import { Router } from 'express';
import { getUrlResponse } from '../services/urlLookupService';
const router = Router();

router.get('/url-lookup', async (req: any, res: any, next: any) => {
  try {
    const { ndc } = req.query;
    if (!ndc) {
      return res.status(400).json({ ok: false, error: 'ndc is required' });
    }
    const ndcStr = String(ndc);
    if (!/^\d{10}$/.test(ndcStr)) {
      return res.status(400).json({ ok: false, error: 'ndc must be a 10-digit numeric string' });
    }

    const data = await getUrlResponse({ ndc: ndcStr });
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
