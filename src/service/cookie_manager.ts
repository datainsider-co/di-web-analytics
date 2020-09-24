export abstract class CookieManger {
  abstract put(key: string, value: string, dayExprire?: number, path?: string): boolean;

  abstract putMaxAge(key: string, value: string, maxAge?: number, path?: string): boolean;

  abstract get(key: string): string | undefined;

  abstract clear(): any;

  abstract remove(key: string, path?: string): boolean;
}

class CookieMangerImpl extends CookieManger {
  put(key: string, value: string, dayExpire = 10, path = '/'): boolean {
    const date = new Date();
    date.setTime(date.getTime() + dayExpire * 24 * 60 * 60 * 1000);
    document.cookie = `${key}=${value};expires=${date.toUTCString()};path=${path}`;
    return true;
  }

  get(key: string) {
    const nameLenPlus = key.length + 1;
    return (
      document.cookie
      .split(';')
      .map(c => c.trim())
      .filter(cookie => {
        return cookie.substring(0, nameLenPlus) === `${key}=`;
      })
      .map(cookie => {
        return decodeURIComponent(cookie.substring(nameLenPlus));
      })[0] || undefined
    );
  }

  remove(key: string, path = '/'): boolean {
    const date = new Date();
    // Set it expire in -1 days
    date.setTime(date.getTime() + -1 * 24 * 60 * 60 * 1000);
    // Set it
    document.cookie = `${key}=;expires=${date.toUTCString()};path=${path}`;
    return true;
  }

  clear() {
    document.cookie.split(';').forEach(cookie => {
      const key = cookie.split('=')[0];
      this.remove(key);
    });
  }

  putMaxAge(key: string, value: string, maxAge?: number, path?: string): boolean {
    document.cookie = `${key}=${value};maxAge=${maxAge};path=${path}`;
    return true;
  }
}

export const cookieManager = new CookieMangerImpl();
