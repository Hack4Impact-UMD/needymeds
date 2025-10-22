import axios from 'axios';
import { getScriptSaveSecret } from '../secrets/secrets'; // placeholder

class ScriptSaveTokenManager {
  token: string;
  expiresAt: number;
  constructor() {
    this.token = '';
    this.expiresAt = Date.now();
  }

  public async getToken() {
    if (Date.now() >= this.expiresAt || !this.token) {
      this.refreshToken();
    }
    return this.token;
  }

  private async refreshToken() {
    const path = '/AuthorizationCore/api/Authentication/AcquireToken';
    const { baseUrl, subscriptionKey } = await getScriptSaveSecret();
    const client = axios.create({
      baseURL: baseUrl,
      timeout: 12000,
      headers: {
        Accept: 'application/json',
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
      validateStatus: () => true,
    });

    const res = await client.get(path);

    if (res.status >= 200 && res.status < 300) {
      const data = res.data;
      this.expiresAt = Date.now() + data.expiresAt;
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
