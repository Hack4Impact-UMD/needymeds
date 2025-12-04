import axios from 'axios';
import { getScriptSaveSecret } from '../secrets/secrets';

class ScriptSaveTokenManager {
  private token: string;
  private expiresAt: number;

  constructor() {
    this.token = '';
    this.expiresAt = 0;
    this.startAutoRefresh();
  }

  // Public method to get the current valid token
  public async getToken(): Promise<string> {
    if (!this.token || Date.now() >= this.expiresAt) {
      return await this.refreshToken();
    } else {
      return this.token;
    }
  }

  // Refresh the token from ScriptSave
  public async refreshToken(): Promise<string> {
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

    const res = await client.post(path, {
      TenantId,
      ClientId,
      ClientSecret,
    });

    if (res.status >= 200 && res.status < 300) {
      const data = res.data;
      this.token = data.accessToken;
      this.expiresAt = Date.now() + (data.expiresIn - 60) * 1000; // Subtract a buffer of 60 seconds to refresh before actual expiry
      return this.token;
    } else {
      const err: any = new Error(`Failed to acquire ScriptSave token: ${res.status}`);
      err.status = res.status;
      throw err;
    }
  }

  // Periodically check and refresh the token
  private startAutoRefresh() {
    // Run every 30 seconds
    setInterval(async () => {
      try {
        if (!this.token || Date.now() >= this.expiresAt - 60_000) {
          await this.refreshToken();
        }
      } catch (err) {
        console.error('[ScriptSaveTokenManager] Token refresh failed', err);
      }
    }, 30_000);
  }

  public async forceRefresh(): Promise<string> {
    this.token = ''; // Clear the token
    this.expiresAt = 0; // Reset expiry
    return await this.refreshToken();
  }
}

export const scriptSaveTokenManager = new ScriptSaveTokenManager();
