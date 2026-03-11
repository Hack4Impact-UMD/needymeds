import jwt from 'jsonwebtoken';
import { generateGoogleWalletJwt } from '../services/googleWallet.service';
import * as secrets from '../secrets/secrets';

jest.mock('../secrets/secrets');
jest.mock('jsonwebtoken');

describe('googleWallet.service', () => {
  it('should generate a signed JWT with correct payload', async () => {
    const mockSecret = {
      privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
      clientEmail: 'mock@test.com',
    };
    (secrets.getGoogleWalletSecret as jest.Mock).mockResolvedValue(mockSecret);
    (jwt.sign as jest.Mock).mockReturnValue('mock_token');

    const cardData = {
      ndc: '123456789',
      labelName: 'Mock Drug',
      pharmacyName: 'Mock Pharmacy',
      price: '$10.00',
    };

    const token = await generateGoogleWalletJwt(cardData);

    expect(token).toBe('mock_token');
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        iss: mockSecret.clientEmail,
        payload: expect.objectContaining({
          genericObjects: expect.arrayContaining([
            expect.objectContaining({
              classId: '3388000000023089438.needymeds_drug_discount_card',
              subheader: { defaultValue: { language: 'en', value: 'Mock Drug' } },
            }),
          ]),
        }),
      }),
      mockSecret.privateKey,
      { algorithm: 'RS256' }
    );
  });
});
