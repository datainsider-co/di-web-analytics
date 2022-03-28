import { Properties } from "../domain";
import { DataManager } from "../misc/data_manager";
import { AnalyticsCore, BaseAnalyticsCore, DisableAnalyticsCore } from "./analytics_core";

export class DiAnalytics {
  private static instance: BaseAnalyticsCore;

  private static getInstance(): BaseAnalyticsCore {
    if (!this.instance) {
      const url = DataManager.getTrackingUrl();
      const trackingApiKey = DataManager.getTrackingApiKey();
      if (url && trackingApiKey) {
        this.init(url, trackingApiKey);
      } else {
        throw new Error("DiAnalytics: You have to call DiAnalytics.getInstance first.");
      }
    }
    return this.instance;
  }

  /**
   * TODO: Clear additional data & queue... etc
   * @param url
   * @param trackingApiKey
   * @param properties
   * @param disable
   */
  static init(url: string, trackingApiKey: string, properties?: Properties, disable?: boolean) {
    if (disable ?? false) {
      this.instance = new DisableAnalyticsCore();
    } else {
      this.instance = this.createAnalytics(url, trackingApiKey, properties);
    }
  }

  private static createAnalytics(url: string, trackingApiKey: string, properties?: Properties): BaseAnalyticsCore {
    if (trackingApiKey && trackingApiKey.length !== 0 && url && url.length !== 0) {
      DataManager.setTrackingUrl(url);
      DataManager.setTrackingApiKey(trackingApiKey);
      return new AnalyticsCore(url, trackingApiKey, properties || {});
    } else {
      throw new Error("DiAnalytics: trackingApiKey must not empty string!");
    }
  }


  static autoTrackDom(cssSelector: string) {
  }

  static enterScreenStart(name: string): Promise<any> {
    return this.getInstance().touchSession().then(_ => {
      this.getInstance().enterScreenStart(name);
    });
  }

  static enterScreen(name: string, properties: Properties = {}): Promise<any> {
    return this.getInstance().touchSession().then(_ => {
      this.getInstance().enterScreen(name, properties);
    });
  }

  static async exitScreen(name: string, properties: Properties = {}): Promise<any> {
    return this.getInstance().touchSession().then(_ => {
      this.getInstance().exitScreen(name, properties);
    });
  }

  static register(properties: Properties) {
    this.getInstance().touchSession().then(_ => {
      this.getInstance().register(properties);
    });

  }

  static time(event: string): DiAnalytics {
    this.getInstance().touchSession().then(_ => {
      this.getInstance().time(event);
    });
    return this;
  }

  static async track(event: string, properties: Properties = {}): Promise<any> {
    await this.getInstance().touchSession();
    return this.getInstance().track(event, properties);
  }

  static async identify(userId: string): Promise<any> {
    await this.getInstance().touchSession();
    return this.getInstance().identify(userId);
  }

  static async setUserProfile(userId: string, properties: Properties = {}): Promise<any> {
    await this.getInstance().touchSession();
    return this.getInstance().setUserProfile(userId, properties);
  }

  static reset(): DiAnalytics {
    this.getInstance().reset();
    return this;
  }
}


