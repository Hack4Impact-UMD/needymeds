import { Router } from 'express';
import { getPriceByNdc, priceByNdcAndNpiList } from '../services/dsnt.service';

const router = Router();

// ---------------------------------------------------------------------------
// New preferred endpoints (functional style)
// ---------------------------------------------------------------------------
router.get('/price', async (req, res, next) => {
  try {
    const { quantity, ndc, radius, zipCode } = req.query;
    if (!quantity || !ndc) {
      return res.status(400).json({ ok: false, error: 'quantity and ndc are required' });
    }
    const data = await getPriceByNdc({
      quantity: String(quantity),
      ndc: String(ndc),
      radius: radius ? String(radius) : undefined,
      zipCode: zipCode ? String(zipCode) : undefined,
    });
    res.json({ ok: true, data });
  } catch (err) { next(err); }
});

router.get('/price-ndc-npi', async (req, res, next) => {
  try {
    const { npilist, quantity, ndc, radius, zipCode } = req.query;
    if (!npilist || !quantity || !ndc) {
      return res.status(400).json({ ok: false, error: 'npilist, quantity and ndc are required' });
    }
    const data = await priceByNdcAndNpiList({
      npilist: String(npilist),
      quantity: String(quantity),
      ndc: String(ndc),
      radius: radius ? String(radius) : undefined,
      zipCode: zipCode ? String(zipCode) : undefined,
    });
    res.json({ ok: true, data });
  } catch (err) { next(err); }
});

export default router;
