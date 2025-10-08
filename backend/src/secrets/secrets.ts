import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

type DsntSecret = {
  baseUrl: string;
  username: string;
  password: string;
};

const region = process.env.AWS_REGION || 'us-east-1';
const secretName = process.env.DSNT_SECRET_NAME || 'needy-meds/dsnt';

const client = new SecretsManagerClient({ region });

let cache: { secret: DsntSecret; exp: number } | null = null;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getDsntSecret(): Promise<DsntSecret> {
  const now = Date.now();
  if (cache && cache.exp > now) return cache.secret;

  // Local development fallback (DO NOT use in production):
  // If developers export DSNT_USERNAME / DSNT_PASSWORD / DSNT_BASE_URL locally,
  // we short-circuit secrets manager to allow manual curl testing without real AWS creds.
  if (process.env.DSNT_USERNAME && process.env.DSNT_PASSWORD && process.env.DSNT_BASE_URL) {
    const secret: DsntSecret = {
      baseUrl: process.env.DSNT_BASE_URL,
      username: process.env.DSNT_USERNAME,
      password: process.env.DSNT_PASSWORD,
    };
    cache = { secret, exp: now + TTL_MS };
    return secret;
  }

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

// Backward-compatible alias (tests or older code may mock/get `getDSNTSecret`)
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getDSNTSecret = getDsntSecret; // legacy name expected by older tests
