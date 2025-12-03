import axios from 'axios';
import { getScriptSaveSecret } from '../secrets/secrets';

class ScriptSaveTokenManager {
  token: string;
  expiresAt: number;
  constructor() {
    this.token = '';
    this.expiresAt = Date.now();
  }

  public async getToken() {
    if (Date.now() >= this.expiresAt || !this.token) {
      await this.refreshToken();
    }
    console.log(Date.now() - this.expiresAt);
    return this.token;
  }

  public async refreshToken() {
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
      this.expiresAt = Date.now() + data.expiresIn * 1000;
      this.token = data.accessToken;
      return this.token;
    } else if (res.status >= 400 && res.status < 500) {
      const err: any = new Error(`ScriptSave returned ${res.status}`);
      err.status = res.status;
      throw err;
    }
  }
}

export const scriptSaveTokenManager = new ScriptSaveTokenManager();
