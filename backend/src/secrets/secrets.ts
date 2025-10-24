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

const region = 'us-east-2';

const client = new SecretsManagerClient({ region });

let cache: {
  dsntSecret: DsntSecret | null;
  scriptSaveSecret: ScriptSaveSecret | null;
  exp: number;
};
cache = { dsntSecret: null, scriptSaveSecret: null, exp: 0 };
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

  cache = { dsntSecret: secret, scriptSaveSecret: cache.scriptSaveSecret, exp: now + TTL_MS };
  return secret;
}

// Backward-compatible alias (tests or older code may mock/get `getDSNTSecret`)
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getDSNTSecret = getDsntSecret; // legacy name expected by older tests

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

  cache = { dsntSecret: cache.dsntSecret, scriptSaveSecret: secret, exp: now + TTL_MS };
  return secret;
}
