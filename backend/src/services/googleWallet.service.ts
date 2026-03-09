import jwt from 'jsonwebtoken';
import { getGoogleWalletSecret } from '../secrets/secrets';

const ISSUER_ID = '3388000000023089438';
const CLASS_ID = '3388000000023089438.needymeds_drug_discount_card';

export interface GoogleWalletCardData {
  ndc: string;
  labelName: string;
  pharmacyName: string;
  price: string;
}

export const generateGoogleWalletJwt = async (cardData: GoogleWalletCardData) => {
  const secret = await getGoogleWalletSecret();

  const payload = {
    iss: secret.clientEmail,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    payload: {
      genericObjects: [
        {
          id: `${ISSUER_ID}.DDC_${cardData.ndc}_${Date.now()}`,
          classId: CLASS_ID,
          genericType: 'GENERIC_OTHER',
          cardTitle: { defaultValue: { language: 'en', value: 'NeedyMeds' } },
          header: { defaultValue: { language: 'en', value: 'Drug Discount Card' } },
          subheader: { defaultValue: { language: 'en', value: cardData.labelName } },
          logo: {
            sourceUri: { uri: 'https://www.needymeds.org/images/needymeds_logo.png' },
          },
          hexBackgroundColor: '#236488',
          textModulesData: [
            { header: 'BIN', body: '015926', id: 'bin' },
            { header: 'PCN', body: 'PRXIDST', id: 'pcn' },
            { header: 'GROUP', body: 'IDST01', id: 'group' },
            { header: 'MEMBER ID', body: 'IDST733224411', id: 'member_id' },
            { header: 'PHARMACY', body: cardData.pharmacyName, id: 'pharmacy' },
            { header: 'PRICE', body: cardData.price, id: 'price' },
          ],
          barcode: {
            type: 'QR_CODE',
            value: cardData.ndc,
          },
        },
      ],
    },
  };

  return jwt.sign(payload, secret.privateKey, { algorithm: 'RS256' });
};
