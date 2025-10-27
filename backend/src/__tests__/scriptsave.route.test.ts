import express from 'express';
import request from 'supertest';
import router from '../routes/scriptsave.route';
import * as service from '../services/scriptsave.service';

// Mock the service layer so no real HTTP calls happen
jest.mock('../services/scriptsave.service');

const app = express();
app.use(express.json());
app.use('/scriptsave', router);

describe('scriptsave.route', () => {
  beforeEach(() => jest.resetAllMocks());

  // ------------------- autoComplete -------------------
  it('GET /scriptsave/autoComplete calls service and returns ok=true', async () => {
    (service.autoComplete as jest.Mock).mockResolvedValue(['drugA', 'drugB']);

    const res = await request(app)
      .get('/scriptsave/autoComplete')
      .query({ prefixText: 'asp', groupID: '10', count: '5' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: ['drugA', 'drugB'] });
    expect(service.autoComplete).toHaveBeenCalledWith({
      prefixText: 'asp',
      groupID: '10',
      count: '5',
    });
  });

  it('GET /scriptsave/autoComplete returns 400 if missing prefixText', async () => {
    const res = await request(app).get('/scriptsave/autoComplete').query({ groupID: '10' });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/required/i);
  });

  // ------------------- findDrugsUsingNDC11 -------------------
  it('GET /scriptsave/findDrugsUsingNDC11 calls service and returns ok=true', async () => {
    (service.findDrugsUsingNDC11 as jest.Mock).mockResolvedValue({ drug: 'ibuprofen' });

    const res = await request(app).get('/scriptsave/findDrugsUsingNDC11').query({
      groupID: '1',
      brandIndicator: 'B',
      ndc: '1234567890',
      includeDrugInfo: 'true',
      includeDrugImage: 'false',
      quantity: '30',
      numPharm: '5',
      zipCode: '12345',
      useUC: 'false',
      ndcOverride: 'true',
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(service.findDrugsUsingNDC11).toHaveBeenCalledWith({
      groupID: '1',
      brandIndicator: 'B',
      ndc: '1234567890',
      includeDrugInfo: 'true',
      includeDrugImage: 'false',
      quantity: '30',
      numPharm: '5',
      zipCode: '12345',
      useUC: 'false',
      ndcOverride: 'true',
    });
  });

  it('GET /scriptsave/findDrugsUsingNDC11 returns 400 if missing params', async () => {
    const res = await request(app).get('/scriptsave/findDrugsUsingNDC11').query({ groupID: '1' }); // missing all others
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/required/i);
  });

  // ------------------- findDrugsUsingDrugName -------------------
  it('GET /scriptsave/findDrugsUsingDrugName calls service and returns ok=true', async () => {
    (service.findDrugsUsingDrugName as jest.Mock).mockResolvedValue({ results: ['drugX'] });

    const res = await request(app).get('/scriptsave/findDrugsUsingDrugName').query({
      groupID: '2',
      brandIndicator: 'G',
      drugName: 'acetaminophen',
      includeDrugInfo: 'true',
      includeDrugImage: 'false',
      quantity: '15',
      numPharm: '3',
      zipCode: '67890',
      useUC: 'true',
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(service.findDrugsUsingDrugName).toHaveBeenCalledWith({
      groupID: '2',
      brandIndicator: 'G',
      drugName: 'acetaminophen',
      includeDrugInfo: 'true',
      includeDrugImage: 'false',
      quantity: '15',
      numPharm: '3',
      zipCode: '67890',
      useUC: 'true',
    });
  });

  it('GET /scriptsave/findDrugsUsingDrugName returns 400 if missing params', async () => {
    const res = await request(app)
      .get('/scriptsave/findDrugsUsingDrugName')
      .query({ groupID: '2', brandIndicator: 'G' });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/required/i);
  });

  // ------------------- findDrugsUsingGSNAndReferencedBN -------------------
  it('GET /scriptsave/findDrugsUsingGSNAndReferencedBN calls service and returns ok=true', async () => {
    (service.findDrugsUsingGSNAndReferencedBN as jest.Mock).mockResolvedValue({ drugs: ['X'] });

    const res = await request(app).get('/scriptsave/findDrugsUsingGSNAndReferencedBN').query({
      groupID: '3',
      brandIndicator: 'B',
      gsn: '12345',
      referencedBN: 'BN123',
      includeDrugInfo: 'true',
      includeDrugImage: 'true',
      quantity: '10',
      numPharm: '2',
      zipCode: '10101',
      useUC: 'false',
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(service.findDrugsUsingGSNAndReferencedBN).toHaveBeenCalledWith({
      groupID: '3',
      brandIndicator: 'B',
      gsn: '12345',
      referencedBN: 'BN123',
      includeDrugInfo: 'true',
      includeDrugImage: 'true',
      quantity: '10',
      numPharm: '2',
      zipCode: '10101',
      useUC: 'false',
    });
  });

  it('GET /scriptsave/findDrugsUsingGSNAndReferencedBN returns 400 if missing params', async () => {
    const res = await request(app)
      .get('/scriptsave/findDrugsUsingGSNAndReferencedBN')
      .query({ groupID: '3' });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/required/i);
  });

  // ------------------- getDrugFormStrength -------------------
  it('GET /scriptsave/getDrugFormStrength returns ok=true and data', async () => {
    (service.getDrugFormStrength as jest.Mock).mockResolvedValue({ drug: 'Aspirin' });

    const res = await request(app)
      .get('/scriptsave/getDrugFormStrength')
      .query({ groupID: '123', gsn: '45678' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: { drug: 'Aspirin' } });
    expect(service.getDrugFormStrength).toHaveBeenCalledWith({
      groupID: '123',
      gsn: '45678',
    });
  });

  it('GET /scriptsave/getDrugFormStrength returns 400 when missing params', async () => {
    const res = await request(app).get('/scriptsave/getDrugFormStrength').query({ groupID: '123' });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/required/i);
  });

  // ------------------- priceDrug -------------------
  it('GET /scriptsave/priceDrug returns ok=true and data', async () => {
    (service.priceDrug as jest.Mock).mockResolvedValue({ price: 9.99 });

    const res = await request(app).get('/scriptsave/priceDrug').query({
      ndc: '1234567890',
      ncpdp: '["12345"]',
      groupID: '1',
      quantity: '30',
      ndcOverride: 'false',
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: { price: 9.99 } });
    expect(service.priceDrug).toHaveBeenCalledWith({
      ndc: '1234567890',
      ncpdp: '["12345"]',
      groupID: '1',
      quantity: '30',
      ndcOverride: 'false',
    });
  });

  it('GET /scriptsave/priceDrug returns 400 when missing params', async () => {
    const res = await request(app).get('/scriptsave/priceDrug').query({
      ndc: '1234567890',
      ncpdp: '["12345"]',
      groupID: '1',
    });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/required/i);
  });

  // ------------------- priceDrugs -------------------
  it('GET /scriptsave/priceDrugs calls service with correct args', async () => {
    (service.priceDrugs as jest.Mock).mockResolvedValue({ pharmacies: [] });

    const res = await request(app).get('/scriptsave/priceDrugs').query({
      ndc: '11111111111',
      groupID: '22',
      quantity: '60',
      numResults: '5',
      zipCode: '90210',
      ndcOverride: 'true',
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(service.priceDrugs).toHaveBeenCalledWith({
      ndc: '11111111111',
      groupID: '22',
      quantity: '60',
      numResults: '5',
      zipCode: '90210',
      ndcOverride: 'true',
    });
  });

  // ------------------- priceDrugsByNCPDP -------------------
  it('POST /scriptsave/priceDrugsByNCPDP calls service', async () => {
    (service.priceDrugsByNCPDP as jest.Mock).mockResolvedValue({ price: 5.55 });

    const res = await request(app).post('/scriptsave/priceDrugsByNCPDP').send({
      ndc: '1234567890',
      ncpdp: '54321',
      groupID: '9',
      quantity: '45',
      ndcOverride: 'false',
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: { price: 5.55 } });
    expect(service.priceDrugsByNCPDP).toHaveBeenCalledWith({
      ndc: '1234567890',
      ncpdp: '54321',
      groupID: '9',
      quantity: '45',
      ndcOverride: 'false',
    });
  });

  // ------------------- generateCardholder -------------------
  it('GET /scriptsave/generateCardholder returns ok=true and data', async () => {
    (service.generateCardholder as jest.Mock).mockResolvedValue({ id: 'abc123' });

    const res = await request(app).get('/scriptsave/generateCardholder').query({ groupID: '999' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: { id: 'abc123' } });
    expect(service.generateCardholder).toHaveBeenCalledWith({ groupID: '999' });
  });

  it('GET /scriptsave/generateCardholder returns 400 if missing groupID', async () => {
    const res = await request(app).get('/scriptsave/generateCardholder');

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/groupID/i);
  });
});
