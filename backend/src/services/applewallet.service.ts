import { PKPass } from 'passkit-generator';
import path from 'path';
import { getAppleWalletSecret, getAppleWalletWWDRSecret } from '../secrets/secrets';

type PassInput = {
  serial: string;
  number: string;
};

export async function createPass({ serial, number }: PassInput) {
  /*Gets the secret from AWS*/
  const secret = await getAppleWalletSecret();
  console.log('Apple Wallet certificate length:', secret.certificate.length);

  const wwdr_secret = await getAppleWalletWWDRSecret();
  console.log('WWDR certificate length:', wwdr_secret.wwdr.length);

  const pass = await PKPass.from(
    {
      model: path.join(process.cwd(), '../backend/src/wallet-pass'),
      certificates: {
        signerCert: secret.certificate,
        signerKey: secret.certificate,
        signerKeyPassphrase: secret.password,
        wwdr: wwdr_secret.wwdr,
      },
    },
    {
      serialNumber: serial,
    }
  );

  pass.primaryFields.push({
    key: 'cardNumber',
    label: 'Card #',
    value: number,
  });

  pass.setBarcodes({
    message: number,
    format: 'PKBarcodeFormatCode128',
    messageEncoding: 'iso-8859-1',
  });

  return pass.getAsBuffer();
}
