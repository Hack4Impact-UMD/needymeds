import request from 'supertest';
import app from '../app';

describe('GET /', () => {
  it('should return 200', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown');
    expect(response.statusCode).toBe(404);
  });
});
