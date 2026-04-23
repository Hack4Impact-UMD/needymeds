console.log('applewallet.service.ts loaded');
import { PKPass } from 'passkit-generator';
import path from 'path';
import { getAppleWalletSecret, getAppleWalletWWDRSecret } from '../secrets/secrets';

type PassInput = {
  serial: string;
  bin: string;
  pcn: string;
  group: string;
  memberId: string;
};

export async function createPass({ serial, bin, pcn, group, memberId }: PassInput) {
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

  pass.primaryFields.push({
    key: 'memberId',
    label: 'MEMBER ID',
    value: memberId,
  });

  pass.secondaryFields.push(
    { key: 'bin', label: 'BIN', value: bin },
    { key: 'pcn', label: 'PCN', value: pcn }
  );
  pass.auxiliaryFields.push(
    { key: 'group', label: 'GROUP', value: group },
  );

  pass.setBarcodes({
    message: memberId,
    format: 'PKBarcodeFormatCode128',
    messageEncoding: 'iso-8859-1',
  });

  return pass.getAsBuffer();
}
