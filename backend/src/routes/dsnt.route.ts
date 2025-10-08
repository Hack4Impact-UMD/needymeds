import { Router } from 'express';
import { DSNTService, getPriceByNdc, priceByNdcAndNpiList } from '../services/dsnt.service';

const router = Router();
const service = new DSNTService(); // legacy interface

// ---------------------------------------------------------------------------
// New preferred endpoints (functional style)
// ---------------------------------------------------------------------------
router.get('/price', async (req, res, next) => {
  try {
    const { quantity, ndc, radius, zipCode } = req.query;
    if (!quantity || !ndc) {
      return res.status(400).json({ error: 'quantity and ndc are required' });
    }
    const data = await getPriceByNdc({
      quantity: String(quantity),
      ndc: String(ndc),
      radius: radius ? String(radius) : undefined,
      zipCode: zipCode ? String(zipCode) : undefined,
    });
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/price-ndc-npi', async (req, res, next) => {
  try {
    const { npilist, quantity, ndc, radius, zipCode } = req.query;
    if (!npilist || !quantity || !ndc) {
      return res.status(400).json({ error: 'npilist, quantity and ndc are required' });
    }
    const data = await priceByNdcAndNpiList({
      npilist: String(npilist),
      quantity: String(quantity),
      ndc: String(ndc),
      radius: radius ? String(radius) : undefined,
      zipCode: zipCode ? String(zipCode) : undefined,
    });
    res.json(data);
  } catch (err) { next(err); }
});

/**
 * GET /dsnt/price-by-ndc?ndc=...&quantity=...&radius=...&zipCode=...
 */
router.get("/price-by-ndc", async (req, res, next) => {
  try {
    const { ndc, quantity, radius, zipCode } = req.query;
    const ndcStr = String(ndc ?? '');
    const qNum = Number(quantity);
    const rNum = Number(radius);
    const zip = String(zipCode ?? '');
    const invalid = !/^\d{11}$/.test(ndcStr) || !(Number.isFinite(qNum) && qNum > 0) || (radius !== undefined && !(Number.isFinite(rNum) && rNum > 0)) || (zip && !/^\d{5}$/.test(zip));
    if (invalid) return res.status(400).json({ ok: false, error: 'invalid parameters' });
    const data = await service.priceByNDC({
      ndc: ndcStr,
      quantity: qNum,
      radius: rNum,
      zipCode: zip,
    });
    res.json({ ok: true, data });
  } catch (err: any) {
    next(err);
  }
});

/**
 * GET /dsnt/price-by-ndc-npi?ndc=...&quantity=...&npilist=1013431949,1326064445
 */
router.get("/price-by-ndc-npi", async (req, res, next) => {
  try {
    const { ndc, quantity, npilist } = req.query;
    const ndcStr = String(ndc ?? '');
    const qNum = Number(quantity);
    const npiStr = String(npilist ?? '');
    const invalid = !/^\d{11}$/.test(ndcStr) || !(Number.isFinite(qNum) && qNum > 0) || !npiStr || npiStr.split(',').some(p => !/^\d{10}$/.test(p));
    if (invalid) return res.status(400).json({ ok: false, error: 'invalid parameters' });
    const data = await service.priceByNdcAndNpiListQuery({
      ndc: ndcStr,
      quantity: qNum,
      npilist: npiStr,
    });
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
