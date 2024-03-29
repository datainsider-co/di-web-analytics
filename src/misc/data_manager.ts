import {Event, Properties as Properties} from '../domain';

export class DataManager {
  static readonly TRACKING_API_KEY = 'di_tracking_api_key';
  static readonly TRACKING_URL = 'di_tracking_url';
  static readonly TRACKING_ID = 'di_tracking_id';
  static readonly USER_ID = 'di_tracking_user_id';
  static readonly GLOBAL_PROPERTIES = 'di_tracking_global_properties';
  static readonly EVENTS = 'di_events';
  static readonly SID = 'di_sid';

  // static reset() {
  //   this.deleteUserId();
  //   this.deleteSID();
  //   // this.deleteGlobalProperties();
  // }

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
    const jsonAsString: string = JSON.stringify(properties);
    localStorage.setItem(DataManager.GLOBAL_PROPERTIES, jsonAsString);
  }

  static getGlobalProperties(): Properties {
    const jsonAsString = localStorage.getItem(DataManager.GLOBAL_PROPERTIES);
    if (jsonAsString) {
      return JSON.parse(jsonAsString);
    } else {
      return {};
    }
  }

  static deleteGlobalProperties() {
    localStorage.removeItem(DataManager.GLOBAL_PROPERTIES);
  }

  static setCustomerId(userId: string): void {
    localStorage.setItem(DataManager.USER_ID, userId);
  }

  static getUserId(): string | undefined {
    return localStorage.getItem(DataManager.USER_ID) || void 0;
  }

  static deleteUserId() {
    localStorage.removeItem(DataManager.USER_ID);
  }

  static saveTemporaryEvents(events: Event[]): void {
    const jsonAsString: string = JSON.stringify(events);
    localStorage.setItem(DataManager.EVENTS, jsonAsString);
  }

  static getTemporaryEvents(): Event[] {
    const jsonAsString = localStorage.getItem(DataManager.EVENTS);
    if (jsonAsString) {
      return JSON.parse(jsonAsString);
    } else {
      return [];
    }
  }

  static deleteTemporaryEvents(): void {
    localStorage.removeItem(DataManager.EVENTS);
  }

  static getSID(): string | undefined {
    return localStorage.getItem(DataManager.SID) || void 0;
  }

  static setSID(sid: string): void {
    return localStorage.setItem(DataManager.SID, sid);
  }

  static deleteSID(): void {
    localStorage.removeItem(DataManager.SID);
  }
}
