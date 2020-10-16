import { Properties as Properties } from '../domain';
import MiniJson from 'mini-json';
import { v4 as uuid } from 'uuid';
import LibConfig from '../domain/config';

export class DataManager {
  static readonly TRACKING_API_KEY = 'di_tracking_api_key';
  static readonly TRACKING_SESSION_ID = 'di_tracking_session_id';
  static readonly TRACKING_SESSION_EXPIRED_AT = 'di_tracking_session_expired_at';
  static readonly TRACKING_ID = 'di_tracking_id';
  static readonly USER_ID = 'di_tracking_user_id';
  static readonly GLOBAL_PROPERTIES = 'di_tracking_global_properties';

  static reset() {
    this.deleteUserId();
    this.deleteGlobalProperties();
  }

  static getActiveSession(): [string, number] {
    let [sessionId, expiredAt] = this.getSession();
    if (!sessionId || (Date.now() >= expiredAt)) {
      return this.createSession();
    } else {
      return [sessionId, expiredAt];
    }
  }

  static touchSession(): [string, number] {
    let [sessionId, expiredAt] = this.getSession();
    if (!sessionId || (Date.now() >= expiredAt)) {
      return this.createSession();
    } else {
      return this.updateSession(sessionId);
    }
  }


  private static isSesstionExpired(): boolean {
    let sessionId = localStorage.getItem(DataManager.TRACKING_SESSION_ID);
    let expiredAt = localStorage.getItem(DataManager.TRACKING_SESSION_EXPIRED_AT);
    if (sessionId && expiredAt) {
      return Date.now() >= Number.parseInt(expiredAt)
    } else {
      return false;
    }
  }

  private static createSession(): [string, number] {
    let sessionId = uuid();
    let expiredAt = Date.now() + LibConfig.sessionMaxInactiveDuration;

    localStorage.setItem(DataManager.TRACKING_SESSION_EXPIRED_AT, expiredAt.toString());
    localStorage.setItem(DataManager.TRACKING_SESSION_ID, sessionId);
    return [sessionId, expiredAt];
  }

  private static updateSession(sessionId: string): [string, number] {
    let expiredAt = Date.now() + LibConfig.sessionMaxInactiveDuration;

    localStorage.setItem(DataManager.TRACKING_SESSION_EXPIRED_AT, expiredAt.toString());
    localStorage.setItem(DataManager.TRACKING_SESSION_ID, sessionId);
    return [sessionId, expiredAt];
  }

  private static getSession(): [string, number] {
    let sessionId = localStorage.getItem(DataManager.TRACKING_SESSION_ID) || '';
    let expiredAt = localStorage.getItem(DataManager.TRACKING_SESSION_EXPIRED_AT) || '0';
    return [sessionId, Number.parseInt(expiredAt)];
  }

  static setTrackingApiKey(apiKey: string): void {
    localStorage.setItem(DataManager.TRACKING_API_KEY, apiKey);
  }

  static getTrackingApiKey(): string | undefined {
    return localStorage.getItem(DataManager.TRACKING_API_KEY) || void 0;
  }

  static deleteTrackingApiKey(): void {
    localStorage.removeItem(DataManager.TRACKING_API_KEY);
  }

  static setGlobalProperties(properties: Properties): void {
    const json = MiniJson.toJson(properties);
    localStorage.setItem(DataManager.GLOBAL_PROPERTIES, json);
  }

  static getGlobalPropertes(): Properties {
    const raw = localStorage.getItem(DataManager.GLOBAL_PROPERTIES);
    if (raw) {
      return MiniJson.fromJson(raw);
    } else {
      return {};
    }
  }

  static deleteGlobalProperties() {
    localStorage.removeItem(DataManager.GLOBAL_PROPERTIES);
  }

  static getTrackingId(): string | undefined {
    return localStorage.getItem(DataManager.TRACKING_ID) || void 0;
  }

  static setTrackingId(trackId: string) {
    localStorage.setItem(DataManager.TRACKING_ID, trackId);
  }

  static deleteTrackingId() {
    localStorage.removeItem(DataManager.TRACKING_ID);
  }

  static setUserId(userId: string): void {
    localStorage.setItem(DataManager.USER_ID, userId);
  }

  static getUserId(): string | undefined {
    return localStorage.getItem(DataManager.USER_ID) || void 0;
  }

  static deleteUserId() {
    localStorage.removeItem(DataManager.USER_ID);
  }
}
