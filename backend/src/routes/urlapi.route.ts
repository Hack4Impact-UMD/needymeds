import { Router } from 'express';
import { getUrlResponse } from '../services/urlapi.service';

const router = Router();

router.get('/url-lookup', async (req: any, res: any, next: any) => {
  try {
    const { ndc } = req.query;
    if (!ndc) {
      return res.status(400).json({ ok: false, error: 'ndc is required' });
    }

    const data = await getUrlResponse({ ndc: String(ndc) });

    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
