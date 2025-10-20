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
    const res = await request(app).get('/scriptsave/getDrugFormStrength').query({ groupID: '123' }); // missing gsn

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/required/i);
  });

  // ------------------- priceDrug -------------------
  it('GET /scriptsave/priceDrug returns ok=true and data', async () => {
    (service.priceDrug as jest.Mock).mockResolvedValue({ price: 9.99 });

    const res = await request(app).get('/scriptsave/priceDrug').query({
      ndc: '12345678901',
      ncpdp: '12345',
      groupID: '1',
      quantity: '30',
      ndcOverride: 'false',
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: { price: 9.99 } });
    expect(service.priceDrug).toHaveBeenCalledWith({
      ndc: '12345678901',
      ncpdp: '12345',
      groupID: '1',
      quantity: '30',
      ndcOverride: 'false',
    });
  });

  it('GET /scriptsave/priceDrug returns 400 when missing params', async () => {
    const res = await request(app).get('/scriptsave/priceDrug').query({
      ndc: '12345678901',
      ncpdp: '12345',
      groupID: '1',
    }); // missing quantity & ndcOverride

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
      ndc: '12345678901',
      ncpdp: '54321',
      groupID: '9',
      quantity: '45',
      ndcOverride: 'false',
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: { price: 5.55 } });
    expect(service.priceDrugsByNCPDP).toHaveBeenCalledWith({
      ndc: '12345678901',
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
