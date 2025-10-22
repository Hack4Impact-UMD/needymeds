import { Router } from 'express';
import {
  autoComplete,
  findDrugsUsingDrugName,
  findDrugsUsingGSNAndReferencedBN,
  findDrugsUsingNDC11,
  generateCardholder,
  getDrugFormStrength,
  priceDrug,
  priceDrugs,
  priceDrugsByNCPDP,
} from '../services/scriptsave.service';

const router = Router();

// ------------------- 001 AutoComplete -------------------
router.get('/autoComplete', async (req, res, next) => {
  try {
    const { prefixText, groupID, count } = req.query;
    if (!prefixText || !groupID) {
      return res.status(400).json({ ok: false, error: 'prefixText and groupID are required' });
    }

    const data = await autoComplete({
      prefixText: String(prefixText),
      groupID: String(groupID),
      count: count !== undefined ? String(count) : undefined,
    });

    res.json({ ok: true, data });
  } catch (err: any) {
    next(err);
  }
});

// ------------------- 002a FindDrugs - Using NDC11 -------------------
router.get('/findDrugsUsingNDC11', async (req, res, next) => {
  try {
    const {
      groupID,
      brandIndicator,
      ndc,
      includeDrugInfo,
      includeDrugImage,
      quantity,
      numPharm,
      zipCode,
      useUC,
      ndcOverride,
    } = req.query;

    const required = [
      'groupID',
      'brandIndicator',
      'ndc',
      'includeDrugInfo',
      'includeDrugImage',
      'quantity',
      'numPharm',
      'zipCode',
      'useUC',
      'ndcOverride',
    ];

    for (const key of required) {
      if (!req.query[key]) {
        return res.status(400).json({ ok: false, error: `${key} is required` });
      }
    }

    const data = await findDrugsUsingNDC11({
      groupID: String(groupID),
      brandIndicator: String(brandIndicator),
      ndc: String(ndc),
      includeDrugInfo: String(includeDrugInfo),
      includeDrugImage: String(includeDrugImage),
      quantity: String(quantity),
      numPharm: String(numPharm),
      zipCode: String(zipCode),
      useUC: String(useUC),
      ndcOverride: String(ndcOverride),
    });

    res.json({ ok: true, data });
  } catch (err: any) {
    next(err);
  }
});

// ------------------- 002b FindDrugs - Using DrugName -------------------
router.get('/findDrugsUsingDrugName', async (req, res, next) => {
  try {
    const {
      groupID,
      brandIndicator,
      drugName,
      includeDrugInfo,
      includeDrugImage,
      quantity,
      numPharm,
      zipCode,
      useUC,
    } = req.query;

    const required = [
      'groupID',
      'brandIndicator',
      'drugName',
      'includeDrugInfo',
      'includeDrugImage',
      'quantity',
      'numPharm',
      'zipCode',
      'useUC',
    ];

    for (const key of required) {
      if (!req.query[key]) {
        return res.status(400).json({ ok: false, error: `${key} is required` });
      }
    }

    const data = await findDrugsUsingDrugName({
      groupID: String(groupID),
      brandIndicator: String(brandIndicator),
      drugName: String(drugName),
      includeDrugInfo: String(includeDrugInfo),
      includeDrugImage: String(includeDrugImage),
      quantity: String(quantity),
      numPharm: String(numPharm),
      zipCode: String(zipCode),
      useUC: String(useUC),
    });

    res.json({ ok: true, data });
  } catch (err: any) {
    next(err);
  }
});

// ------------------- 002c FindDrugs - Using GSN and ReferencedBN -------------------
router.get('/findDrugsUsingGSNAndReferencedBN', async (req, res, next) => {
  try {
    const {
      groupID,
      brandIndicator,
      gsn,
      referencedBN,
      includeDrugInfo,
      includeDrugImage,
      quantity,
      numPharm,
      zipCode,
      useUC,
    } = req.query;

    const required = [
      'groupID',
      'brandIndicator',
      'gsn',
      'referencedBN',
      'includeDrugInfo',
      'includeDrugImage',
      'quantity',
      'numPharm',
      'zipCode',
      'useUC',
    ];

    for (const key of required) {
      if (!req.query[key]) {
        return res.status(400).json({ ok: false, error: `${key} is required` });
      }
    }

    const data = await findDrugsUsingGSNAndReferencedBN({
      groupID: String(groupID),
      brandIndicator: String(brandIndicator),
      gsn: String(gsn),
      referencedBN: String(referencedBN),
      includeDrugInfo: String(includeDrugInfo),
      includeDrugImage: String(includeDrugImage),
      quantity: String(quantity),
      numPharm: String(numPharm),
      zipCode: String(zipCode),
      useUC: String(useUC),
    });

    res.json({ ok: true, data });
  } catch (err: any) {
    next(err);
  }
});

// ------------------- 003 GetDrugFormStrength -------------------
router.get('/getDrugFormStrength', async (req, res, next) => {
  try {
    const { groupID, gsn } = req.query;
    if (!groupID || !gsn) {
      return res.status(400).json({ ok: false, error: 'groupID and gsn are required' });
    }

    const data = await getDrugFormStrength({
      groupID: String(groupID),
      gsn: String(gsn),
    });

    res.json({ ok: true, data });
  } catch (err: any) {
    next(err);
  }
});

// ------------------- 004 PriceDrug -------------------
router.get('/priceDrug', async (req, res, next) => {
  try {
    const { ndc, ncpdp, groupID, quantity, ndcOverride } = req.query;
    if (!ndc || !ncpdp || !groupID || !quantity || !ndcOverride) {
      return res
        .status(400)
        .json({ ok: false, error: 'ndc, ncpdp, groupID, quantity, and ndcOverride are required' });
    }

    const data = await priceDrug({
      ndc: String(ndc),
      ncpdp: String(ncpdp),
      groupID: String(groupID),
      quantity: String(quantity),
      ndcOverride: String(ndcOverride),
    });

    res.json({ ok: true, data });
  } catch (err: any) {
    next(err);
  }
});

// ------------------- 005 PriceDrugs -------------------
router.get('/priceDrugs', async (req, res, next) => {
  try {
    const { ndc, groupID, quantity, numResults, zipCode, ndcOverride } = req.query;
    if (!ndc || !groupID || !quantity || !numResults || !zipCode || !ndcOverride) {
      return res.status(400).json({
        ok: false,
        error: 'ndc, groupID, quantity, numResults, zipCode, and ndcOverride are required',
      });
    }

    const data = await priceDrugs({
      ndc: String(ndc),
      groupID: String(groupID),
      quantity: String(quantity),
      numResults: String(numResults),
      zipCode: String(zipCode),
      ndcOverride: String(ndcOverride),
    });

    res.json({ ok: true, data });
  } catch (err: any) {
    next(err);
  }
});

// ------------------- 006 PriceDrugsByNCPDP -------------------
router.post('/priceDrugsByNCPDP', async (req, res, next) => {
  try {
    const { ndc, ncpdp, groupID, quantity, ndcOverride } = req.body;
    if (!ndc || !ncpdp || !groupID || !quantity || !ndcOverride) {
      return res.status(400).json({
        ok: false,
        error: 'ndc, ncpdp, groupID, quantity, and ndcOverride are required',
      });
    }

    const data = await priceDrugsByNCPDP({
      ndc: String(ndc),
      ncpdp: String(ncpdp),
      groupID: String(groupID),
      quantity: String(quantity),
      ndcOverride: String(ndcOverride),
    });

    res.json({ ok: true, data });
  } catch (err: any) {
    next(err);
  }
});

// ------------------- 007 GenerateCardholder -------------------
router.get('/generateCardholder', async (req, res, next) => {
  try {
    const { groupID } = req.query;
    if (!groupID) {
      return res.status(400).json({ ok: false, error: 'groupID is required' });
    }

    const data = await generateCardholder({ groupID: String(groupID) });
    res.json({ ok: true, data });
  } catch (err: any) {
    next(err);
  }
});

export default router;
