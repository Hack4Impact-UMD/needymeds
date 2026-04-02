import request from 'supertest';
import app from '../app';

describe('GET /api/applewallet', () => {
  test('returns pkpass file', async () => {
    const response = await request(app).get('/api/applewallet').send({
      serial: '123',
      number: '999',
    });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/vnd.apple.pkpass');
  });
});
