import { Router } from 'express';
import { getPriceByNdc, priceByNdcAndNpiList } from '../services/dsnt.service.js';

const router = Router();

/** GET /api/dsnt/price
 *  Query: quantity (req), ndc (req), radius?, zipCode?
 */
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
  } catch (err) {
    next(err);
  }
});

/** GET /api/dsnt/price-ndc-npi
 *  Query: npilist (req), quantity (req), ndc (req), radius?, zipCode?
 *  (Key name must be 'npilist' to match DS&T exactly.)
 */
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
  } catch (err) {
    next(err);
  }
});

export default router;
