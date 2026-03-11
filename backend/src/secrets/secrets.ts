import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import forge from 'node-forge';

type DsntSecret = {
  baseUrl: string;
  username: string;
  password: string;
};

type ScriptSaveSecret = {
  baseUrl: string;
  subscriptionKey: string;
  TenantId: string;
  ClientId: string;
  ClientSecret: string;
};

type UrlApiSecret = {
  baseUrl: string;
  xApiKey: string;
};

type AppleWalletSecret = {
  //certificate: Buffer;
  //password: string;
  signerCert: string;
  signerKey: string;
};

type AppleWalletWWDRSecret = {
  wwdr: Buffer;
};

const region = 'us-east-1';

const client = new SecretsManagerClient({ region });

let cache: {
  dsntSecret: DsntSecret | null;
  scriptSaveSecret: ScriptSaveSecret | null;
  urlApiSecret: UrlApiSecret | null;
  appleWalletSecret: AppleWalletSecret | null;
  appleWalletWWDRSecret: AppleWalletWWDRSecret | null;

  exp: number;
};
cache = {
  dsntSecret: null,
  scriptSaveSecret: null,
  urlApiSecret: null,
  appleWalletSecret: null,
  appleWalletWWDRSecret: null,

  exp: 0,
};
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getDsntSecret(): Promise<DsntSecret> {
  const now = Date.now();
  if (cache.dsntSecret && cache.exp > now) return cache.dsntSecret;

  const cmd = new GetSecretValueCommand({ SecretId: 'needy-meds/dsnt' });
  const res = await client.send(cmd);

  const raw =
    res.SecretString ?? (res.SecretBinary ? Buffer.from(res.SecretBinary).toString('utf-8') : '');
  if (!raw) throw new Error('Empty DSNT secret');

  const parsed = JSON.parse(raw);
  const secret: DsntSecret = {
    baseUrl: parsed.baseUrl,
    username: parsed.username,
    password: parsed.password,
  };

  cache = {
    dsntSecret: secret,
    scriptSaveSecret: cache.scriptSaveSecret,
    urlApiSecret: cache.urlApiSecret,
    appleWalletSecret: cache.appleWalletSecret,
    appleWalletWWDRSecret: cache.appleWalletWWDRSecret,
    exp: now + TTL_MS,
  };
  return secret;
}

export async function getScriptSaveSecret(): Promise<ScriptSaveSecret> {
  const now = Date.now();
  if (cache.scriptSaveSecret && cache.exp > now) return cache.scriptSaveSecret;

  const cmd = new GetSecretValueCommand({ SecretId: 'needy-meds/scriptsave' });
  const res = await client.send(cmd);

  const raw =
    res.SecretString ?? (res.SecretBinary ? Buffer.from(res.SecretBinary).toString('utf-8') : '');
  if (!raw) throw new Error('Empty ScriptSave secret');

  const parsed = JSON.parse(raw);
  const secret: ScriptSaveSecret = {
    baseUrl: parsed.baseUrl,
    subscriptionKey: parsed.subscriptionKey,
    TenantId: parsed.TenantId,
    ClientId: parsed.ClientId,
    ClientSecret: parsed.ClientSecret,
  };

  cache = {
    dsntSecret: cache.dsntSecret,
    scriptSaveSecret: secret,
    urlApiSecret: cache.urlApiSecret,
    appleWalletSecret: cache.appleWalletSecret,
    appleWalletWWDRSecret: cache.appleWalletWWDRSecret,
    exp: now + TTL_MS,
  };
  return secret;
}

export async function getUrlApiSecret(): Promise<UrlApiSecret> {
  const now = Date.now();
  if (cache.urlApiSecret && cache.exp > now) return cache.urlApiSecret;

  const cmd = new GetSecretValueCommand({ SecretId: 'needy-meds/urlapi' });
  const res = await client.send(cmd);

  const raw =
    res.SecretString ?? (res.SecretBinary ? Buffer.from(res.SecretBinary).toString('utf-8') : '');
  if (!raw) throw new Error('Empty UrlApi secret');

  const parsed = JSON.parse(raw);
  const secret: UrlApiSecret = {
    baseUrl: parsed.baseUrl,
    xApiKey: parsed.xApiKey,
  };

  cache = {
    dsntSecret: cache.dsntSecret,
    scriptSaveSecret: cache.scriptSaveSecret,
    urlApiSecret: secret,
    appleWalletSecret: cache.appleWalletSecret,
    appleWalletWWDRSecret: cache.appleWalletWWDRSecret,
    exp: now + TTL_MS,
  };
  return secret;
}

export async function getAppleWalletSecret(): Promise<AppleWalletSecret> {
  const now = Date.now();
  if (cache.appleWalletSecret && cache.exp > now) return cache.appleWalletSecret;

  const cmd = new GetSecretValueCommand({ SecretId: 'apple-wallet-pass-certificate' });
  const res = await client.send(cmd);

  const raw =
    res.SecretString ?? (res.SecretBinary ? Buffer.from(res.SecretBinary).toString('utf-8') : '');
  if (!raw) throw new Error('Empty Apple Wallet secret');

  const parsed = JSON.parse(raw);
  console.log('Parsed Apple Wallet secret:', parsed);

  //const p12Buffer = Buffer.from(parsed.certificate, 'base64');
  //const password = parsed.password;

  //Delete below once aws is fixed
  const [certificateBase64, password_ob] = Object.entries(parsed)[0];
  const password = password_ob as string;
  const p12Buffer = Buffer.from(certificateBase64, 'base64');

  // Convert P12 -> forge object
  const p12Der = forge.util.createBuffer(p12Buffer.toString('binary'));
  const p12Asn1 = forge.asn1.fromDer(p12Der);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

  let signerCert = '';
  let signerKey = '';

  for (const safeContents of p12.safeContents) {
    for (const safeBag of safeContents.safeBags) {
      if (safeBag.type === forge.pki.oids.certBag) {
        signerCert = forge.pki.certificateToPem(safeBag.cert!);
      }

      if (safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {
        signerKey = forge.pki.privateKeyToPem(safeBag.key!);
      }
    }
  }

  if (!signerCert || !signerKey) {
    throw new Error('Failed to extract certificate or key from p12');
  }

  const secret: AppleWalletSecret = {
    signerCert,
    signerKey,
  };

  cache = {
    dsntSecret: cache.dsntSecret,
    scriptSaveSecret: cache.scriptSaveSecret,
    urlApiSecret: cache.urlApiSecret,
    appleWalletSecret: secret,
    appleWalletWWDRSecret: cache.appleWalletWWDRSecret,
    exp: now + TTL_MS,
  };
  return secret;
}

export async function getAppleWalletWWDRSecret(): Promise<AppleWalletWWDRSecret> {
  const now = Date.now();
  if (cache.appleWalletWWDRSecret && cache.exp > now) return cache.appleWalletWWDRSecret;

  const cmd = new GetSecretValueCommand({ SecretId: 'apple-wallet-wwdr' });
  const res = await client.send(cmd);

  const raw =
    res.SecretString ?? (res.SecretBinary ? Buffer.from(res.SecretBinary).toString('utf-8') : '');
  if (!raw) throw new Error('Empty WWDR secret');

  const parsed = JSON.parse(raw);
  const secret: AppleWalletWWDRSecret = {
    wwdr: Buffer.from(parsed.wwdr, 'base64'),
  };

  cache = {
    dsntSecret: cache.dsntSecret,
    scriptSaveSecret: cache.scriptSaveSecret,
    urlApiSecret: cache.urlApiSecret,
    appleWalletSecret: cache.appleWalletSecret,
    appleWalletWWDRSecret: secret,
    exp: now + TTL_MS,
  };
  return secret;
}
