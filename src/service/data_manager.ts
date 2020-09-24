import {Property} from '../domain';
import MiniJson from 'mini-json';

export abstract class DataManager {
  static readonly API_KEY = 'api_key';
  static readonly DEFAULT_PROPERTY = 'default_property';
  static readonly TRACK_ID = 'track_id';
  static readonly USER_ID = 'user_id';

  static setApiKey(apiKey: string): void {
    localStorage.setItem(DataManager.API_KEY, apiKey);
  }

  static getApiKey(): string | undefined {
    return localStorage.getItem(DataManager.API_KEY) || void 0;
  }

  static removeApiKey(): void {
    localStorage.removeItem(DataManager.API_KEY);
  }

  static setDefaultProperty(property: Property): void {
    const raw = MiniJson.toJson(property);
    localStorage.setItem(DataManager.DEFAULT_PROPERTY, raw);
  }

  static getDefaultProperty(): Property | undefined {
    const raw = localStorage.getItem(DataManager.DEFAULT_PROPERTY);
    if (raw) {
      return MiniJson.fromJson(raw);
    } else {
      return void 0;
    }
  }

  static removeDefaultProperty() {
    localStorage.removeItem(DataManager.DEFAULT_PROPERTY);
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
