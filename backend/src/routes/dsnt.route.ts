import { Router } from 'express';
import { getPriceByNdc, priceByNdcAndNpiList } from '../services/dsnt.service';
import { stringIfDefined } from '../utils/stringIfDefined';

const router = Router();

// ------------------- Price by NDC -------------------
router.get('/price', async (req, res, next) => {
  try {
    const { quantity, ndc, radius, zipCode } = req.query;
    if (!quantity || !ndc || !zipCode) {
      return res.status(400).json({ ok: false, error: 'quantity, ndc, and zipCode are required' });
    }
    const data = await getPriceByNdc({
      quantity: String(quantity),
      ndc: String(ndc),
      radius: stringIfDefined(radius),
      zipCode: stringIfDefined(zipCode),
    });
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
});

// ------------------- Price by NDC and NPI List -------------------
router.get('/price-ndc-npi', async (req, res, next) => {
  try {
    const { npilist, quantity, ndc, radius, zipCode } = req.query;
    if (!npilist || !quantity || !ndc) {
      return res.status(400).json({ ok: false, error: 'npilist, quantity, and ndc are required' });
    }
    const data = await priceByNdcAndNpiList({
      npilist: String(npilist),
      quantity: String(quantity),
      ndc: String(ndc),
      radius: stringIfDefined(radius),
      zipCode: stringIfDefined(zipCode),
    });
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
