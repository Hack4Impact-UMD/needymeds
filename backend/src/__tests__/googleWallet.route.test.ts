import request from 'supertest';
import app from '../app';
import * as walletService from '../services/googleWallet.service';

jest.mock('../services/googleWallet.service');

describe('GET /api/wallet/google', () => {
  it('should return 200 and the wallet URL', async () => {
    (walletService.generateGoogleWalletJwt as jest.Mock).mockResolvedValue('mock_token');

    const cardData = {
      ndc: '123456789',
      labelName: 'Mock Drug',
      pharmacyName: 'Mock Pharmacy',
      price: '$10.00',
    };

    const response = await request(app).get('/api/wallet/google').send(cardData);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      data: {
        url: 'https://pay.google.com/gp/v/save/mock_token',
      },
    });
  });

  it('should return 500 if service fails', async () => {
    (walletService.generateGoogleWalletJwt as jest.Mock).mockRejectedValue(new Error('Fail'));

    const response = await request(app).get('/api/wallet/google').send({});

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      ok: false,
      error: 'Fail',
    });
  });
});
