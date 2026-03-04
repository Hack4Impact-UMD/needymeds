import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

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

type GoogleWalletSecret = {
  privateKey: string;
  clientEmail: string;
};

const region = 'us-east-1';

const client = new SecretsManagerClient({ region });

let cache: {
  dsntSecret: DsntSecret | null;
  scriptSaveSecret: ScriptSaveSecret | null;
  urlApiSecret: UrlApiSecret | null;
  googleWalletSecret: GoogleWalletSecret | null;
  exp: number;
};
cache = {
  dsntSecret: null,
  scriptSaveSecret: null,
  urlApiSecret: null,
  googleWalletSecret: null,
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
    ...cache,
    dsntSecret: secret,
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
    ...cache,
    scriptSaveSecret: secret,
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
    ...cache,
    urlApiSecret: secret,
    exp: now + TTL_MS,
  };
  return secret;
}

export async function getGoogleWalletSecret(): Promise<GoogleWalletSecret> {
  const now = Date.now();
  if (cache.googleWalletSecret && cache.exp > now) return cache.googleWalletSecret;

  const cmd = new GetSecretValueCommand({ SecretId: 'google-wallet-service-account-key' });
  const res = await client.send(cmd);

  const raw =
    res.SecretString ?? (res.SecretBinary ? Buffer.from(res.SecretBinary).toString('utf-8') : '');
  if (!raw) throw new Error('Empty Google Wallet secret');

  const parsed = JSON.parse(raw);
  const secret: GoogleWalletSecret = {
    privateKey: parsed.private_key,
    clientEmail: parsed.client_email,
  };

  cache = {
    ...cache,
    googleWalletSecret: secret,
    exp: now + TTL_MS,
  };
  return secret;
}
