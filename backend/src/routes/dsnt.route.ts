import { Router } from 'express';
import { getPriceByNdc, priceByNdcAndNpiList } from '../services/dsnt.service';

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
import { Router } from "express";
import { DSNTService } from "../services/dsnt.service";

const router = Router();
const service = new DSNTService();

/**
 * GET /dsnt/price-by-ndc?ndc=...&quantity=...&radius=...&zipCode=...
 */
router.get("/price-by-ndc", async (req, res, next) => {
  try {
    const { ndc, quantity, radius, zipCode } = req.query;
    const data = await service.priceByNDC({
      ndc: String(ndc ?? ""),
      quantity: Number(quantity),
      radius: Number(radius),
      zipCode: String(zipCode ?? ""),
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
    const data = await service.priceByNdcAndNpiListQuery({
      ndc: String(ndc ?? ""),
      quantity: Number(quantity),
      npilist: String(npilist ?? ""),
    });
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
