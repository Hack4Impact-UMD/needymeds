import { Router } from 'express';
import { generateGoogleWalletJwt } from '../services/googleWallet.service';

const router = Router();

router.get('/google', async (req, res, next) => {
  try {
    const token = await generateGoogleWalletJwt(req.body);
    res.json({ ok: true, data: { url: `https://pay.google.com/gp/v/save/${token}` } });
  } catch (error) {
    next(error);
  }
});

export default router;
