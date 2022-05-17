import {Properties as Properties} from '../domain';
import MiniJson from 'mini-json';

export class DataManager {
  static readonly TRACKING_API_KEY = 'di_tracking_api_key';
  static readonly TRACKING_URL = 'di_tracking_url';
  static readonly TRACKING_ID = 'di_tracking_id';
  static readonly USER_ID = 'di_tracking_user_id';
  static readonly GLOBAL_PROPERTIES = 'di_tracking_global_properties';

  static reset() {
    this.deleteUserId();
    this.deleteGlobalProperties();
  }

  static setTrackingHost(url: string): void {
    localStorage.setItem(DataManager.TRACKING_URL, url);
  }

  static getTrackingHost(): string | undefined {
    return localStorage.getItem(DataManager.TRACKING_URL) || void 0;
  }

  static deleteTrackingHost(): void {
    localStorage.removeItem(DataManager.TRACKING_URL);
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

  static getGlobalProperties(): Properties {
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
