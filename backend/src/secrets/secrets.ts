import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

type DsntSecret = {
  baseUrl: string; // e.g., "https://argusprod.dtsystems.com"
  username: string;
  password: string;
};

const region = process.env.AWS_REGION || 'us-east-1';
const secretName = process.env.DSNT_SECRET_NAME || 'needy-meds/dsnt';

const client = new SecretsManagerClient({ region });

// simple in-memory cache to avoid hitting SM on every request
let cache: { secret: DsntSecret; exp: number } | null = null;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getDsntSecret(): Promise<DsntSecret> {
  const now = Date.now();
  if (cache && cache.exp > now) return cache.secret;

  const cmd = new GetSecretValueCommand({ SecretId: secretName });
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

  cache = { secret, exp: now + TTL_MS };
  return secret;
}
