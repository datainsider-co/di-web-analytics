import { Properties as Properties } from '../domain';
import MiniJson from 'mini-json';

export class DataManager {
  static readonly API_KEY = 'di_tracking_api_key';
  static readonly TRACK_ID = 'di_tracking_id';
  static readonly USER_ID = 'di_tracking_user_id';
  static readonly GLOBAL_PROPERTIES = 'global_properties';

  static setApiKey(apiKey: string): void {
    localStorage.setItem(DataManager.API_KEY, apiKey);
  }

  static getApiKey(): string | undefined {
    return localStorage.getItem(DataManager.API_KEY) || void 0;
  }

  static removeApiKey(): void {
    localStorage.removeItem(DataManager.API_KEY);
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

  static removeDefaultProperty() {
    localStorage.removeItem(DataManager.GLOBAL_PROPERTIES);
  }

  static getTrackId(): string | undefined {
    return localStorage.getItem(DataManager.TRACK_ID) || void 0;
  }

  static setTrackId(trackId: string) {
    localStorage.setItem(DataManager.TRACK_ID, trackId);
  }

  static setUserId(userId: string): void {
    localStorage.setItem(this.USER_ID, userId);
  }

  static getUserId(): string | undefined {
    return localStorage.getItem(this.USER_ID) || void 0;
  }
}
