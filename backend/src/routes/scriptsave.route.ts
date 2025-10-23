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
import { stringIfDefined } from '../utils/stringIfDefined';

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
      count: stringIfDefined(count),
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

    if (!groupID || !ndc) {
      return res.status(400).json({ ok: false, error: 'groupID and ndc are required' });
    }

    const data = await findDrugsUsingNDC11({
      groupID: String(groupID),
      brandIndicator: stringIfDefined(brandIndicator),
      ndc: String(ndc),
      includeDrugInfo: stringIfDefined(includeDrugInfo),
      includeDrugImage: stringIfDefined(includeDrugImage),
      quantity: stringIfDefined(quantity),
      numPharm: stringIfDefined(numPharm),
      zipCode: stringIfDefined(zipCode),
      useUC: stringIfDefined(useUC),
      ndcOverride: stringIfDefined(ndcOverride),
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

    if (!groupID || !drugName) {
      return res.status(400).json({ ok: false, error: 'groupID and drugName are required' });
    }

    const data = await findDrugsUsingDrugName({
      groupID: String(groupID),
      brandIndicator: stringIfDefined(brandIndicator),
      drugName: String(drugName),
      includeDrugInfo: stringIfDefined(includeDrugInfo),
      includeDrugImage: stringIfDefined(includeDrugImage),
      quantity: stringIfDefined(quantity),
      numPharm: stringIfDefined(numPharm),
      zipCode: stringIfDefined(zipCode),
      useUC: stringIfDefined(useUC),
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

    if (!groupID || !gsn) {
      return res.status(400).json({ ok: false, error: 'groupID and gsn are required' });
    }

    const data = await findDrugsUsingGSNAndReferencedBN({
      groupID: String(groupID),
      brandIndicator: stringIfDefined(brandIndicator),
      gsn: String(gsn),
      referencedBN: stringIfDefined(referencedBN),
      includeDrugInfo: stringIfDefined(includeDrugInfo),
      includeDrugImage: stringIfDefined(includeDrugImage),
      quantity: stringIfDefined(quantity),
      numPharm: stringIfDefined(numPharm),
      zipCode: stringIfDefined(zipCode),
      useUC: stringIfDefined(useUC),
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
    if (!ndc || !ncpdp || !groupID || !quantity) {
      return res
        .status(400)
        .json({ ok: false, error: 'ndc, ncpdp, groupID, and quantity are required' });
    }

    const data = await priceDrug({
      ndc: String(ndc),
      ncpdp: String(ncpdp),
      groupID: String(groupID),
      quantity: String(quantity),
      ndcOverride: stringIfDefined(ndcOverride),
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
    if (!ndc || !groupID || !quantity || !numResults || !zipCode) {
      return res.status(400).json({
        ok: false,
        error: 'ndc, groupID, quantity, numResults and zipCode are required',
      });
    }

    const data = await priceDrugs({
      ndc: String(ndc),
      groupID: String(groupID),
      quantity: String(quantity),
      numResults: String(numResults),
      zipCode: String(zipCode),
      ndcOverride: stringIfDefined(ndcOverride),
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
    if (!ndc || !ncpdp || !groupID || !quantity) {
      return res.status(400).json({
        ok: false,
        error: 'ndc, ncpdp, groupID, and quantity are required',
      });
    }

    const data = await priceDrugsByNCPDP({
      ndc: String(ndc),
      ncpdp: String(ncpdp),
      groupID: String(groupID),
      quantity: String(quantity),
      ndcOverride: stringIfDefined(ndcOverride),
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
