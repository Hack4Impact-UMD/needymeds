import axios from 'axios';
import { randomUUID } from 'crypto';
import { getScriptSaveSecret } from '../secrets/secrets';

class ScriptSaveTokenManager {
  private token: string;
  private expiresAt: number;
  private instanceId: string;

  constructor() {
    this.token = '';
    this.expiresAt = 0;

    // Helps debug multi-instance behavior
    this.instanceId = randomUUID().slice(0, 8);

    console.log(`[TokenManager:${this.instanceId}] Initialized`);
    this.startAutoRefresh();
  }

  // Public method to get the current valid token
  public async getToken(): Promise<string> {
    if (!this.token || Date.now() >= this.expiresAt) {
      console.log(`[TokenManager:${this.instanceId}] Token missing or expired → refreshing`);
      return await this.refreshToken();
    } else {
      console.log(
        `[TokenManager:${this.instanceId}] Token valid, ${Math.round(
          (this.expiresAt - Date.now()) / 1000
        )}s remaining`
      );
      return this.token;
    }
  }

  // Refresh the token from ScriptSave
  public async refreshToken(): Promise<string> {
    console.log(`[TokenManager:${this.instanceId}] Refreshing ScriptSave token…`);

    const path = '/AuthorizationCore/api/Authentication/AcquireToken';
    const { baseUrl, subscriptionKey, TenantId, ClientId, ClientSecret } =
      await getScriptSaveSecret();

    const client = axios.create({
      baseURL: baseUrl,
      timeout: 12000,
      headers: {
        'Content-Type': 'application/json',
        'OCP-APIM-Subscription-Key': subscriptionKey,
      },
      validateStatus: () => true,
    });

    const start = Date.now();
    const res = await client.post(path, { TenantId, ClientId, ClientSecret });
    const duration = Date.now() - start;

    console.log(
      `[TokenManager:${this.instanceId}] AcquireToken response: status=${res.status}, time=${duration}ms`
    );

    if (res.status >= 200 && res.status < 300) {
      const data = res.data;

      console.log(
        `[TokenManager:${this.instanceId}] Token acquired successfully; expiresIn=${data.expiresIn}s`
      );

      this.token = data.accessToken;
      this.expiresAt = Date.now() + (data.expiresIn - 60) * 1000;

      console.log(
        `[TokenManager:${this.instanceId}] Local expiresAt=${new Date(
          this.expiresAt
        ).toISOString()}`
      );

      return this.token;
    } else {
      console.error(`[TokenManager:${this.instanceId}] AcquireToken FAILED`, res.status, res.data);

      const err: any = new Error(`Failed to acquire ScriptSave token: ${res.status}`);
      err.status = res.status;
      throw err;
    }
  }

  // Periodically check and refresh the token
  private startAutoRefresh() {
    console.log(`[TokenManager:${this.instanceId}] Auto-refresh started`);

    setInterval(async () => {
      try {
        const remaining = this.expiresAt - Date.now();

        if (!this.token) {
          console.log(`[TokenManager:${this.instanceId}] No token yet → refreshing`);
          await this.refreshToken();
          return;
        }

        if (remaining <= 60_000) {
          console.log(
            `[TokenManager:${this.instanceId}] Token expiring soon (${Math.round(
              remaining / 1000
            )}s) → refreshing`
          );
          await this.refreshToken();
        } else {
          console.log(
            `[TokenManager:${this.instanceId}] Auto-refresh skipped, token still valid (${Math.round(
              remaining / 1000
            )}s)`
          );
        }
      } catch (err) {
        console.error(
          `[TokenManager:${this.instanceId}] Token refresh FAILED in auto-refresh loop`,
          err
        );
      }
    }, 30_000);
  }

  public async forceRefresh(): Promise<string> {
    console.log(`[TokenManager:${this.instanceId}] FORCE REFRESH triggered`);
    this.token = '';
    this.expiresAt = 0;
    return await this.refreshToken();
  }
}

export const scriptSaveTokenManager = new ScriptSaveTokenManager();
