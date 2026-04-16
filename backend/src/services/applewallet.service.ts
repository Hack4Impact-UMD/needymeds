console.log('applewallet.service.ts loaded');
import { PKPass } from 'passkit-generator';
import path from 'path';
import { getAppleWalletSecret, getAppleWalletWWDRSecret } from '../secrets/secrets';

type PassInput = {
  serial: string;
  number: string;
};

export async function createPass({ serial, number }: PassInput) {
  /*Gets the secret from AWS*/
  console.log('Reached the Create Pass function');
  const secret = await getAppleWalletSecret();
  console.log('Apple Wallet certificate length:', secret.signerCert.length);

  const wwdr_secret = await getAppleWalletWWDRSecret();
  console.log('WWDR certificate length:', wwdr_secret.wwdr.length);

  const pass = await PKPass.from(
    {
      model: path.join(__dirname, '../wallet-pass.pass'),
      certificates: {
        signerCert: secret.signerCert,
        signerKey: secret.signerKey,
        wwdr: wwdr_secret.wwdr,
      },
    },
    {
      serialNumber: serial,
    }
  );

  // Replace existing cardNumber field if present
  const existingFieldIndex = pass.primaryFields.findIndex((f: any) => f.key === 'cardNumber');

  if (existingFieldIndex !== -1) {
    pass.primaryFields[existingFieldIndex].value = number;
  } else {
    pass.primaryFields.push({
      key: 'cardNumber',
      label: 'Card #',
      value: number,
    });
  }

  pass.setBarcodes({
    message: number,
    format: 'PKBarcodeFormatCode128',
    messageEncoding: 'iso-8859-1',
  });

  return pass.getAsBuffer();
}
