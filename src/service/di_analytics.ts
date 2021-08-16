import {Properties} from '../domain';
import {DataManager} from '../misc/data_manager';
import {AnalyticsCore, BaseAnalyticsCore, NoopAnalyticsCore} from './analytics_core';
import NotifyUsingCookies from '../misc/notify_using_cookies';

export class DiAnalytics {
  private static instance: BaseAnalyticsCore;

  private static getInstance(): BaseAnalyticsCore {
    if (!this.instance) {
      const trackingApiKey = DataManager.getTrackingApiKey();
      if (trackingApiKey) {
        this.init(trackingApiKey);
      } else {
        throw new Error('DiAnalytics: You have to call DiAnalytics.getInstance first.');
      }
    }
    return this.instance;
  }

  /**
   * TODO: Clear additional data & queue... etc
   * @param trackingApiKey
   * @param properties
   * @param isNoop
   */
  static init(trackingApiKey: string, properties?: Properties, isNoop?: boolean) {
    if (isNoop ?? false) {
      this.instance = new NoopAnalyticsCore();
    } else {
      this.instance = this.createAnalytics(trackingApiKey, properties);
    }
  }

  private static createAnalytics(trackingApiKey: string, properties?: Properties): BaseAnalyticsCore {
    if (trackingApiKey && trackingApiKey.length !== 0) {
      DataManager.setTrackingApiKey(trackingApiKey);
      return new AnalyticsCore(trackingApiKey, properties || {});
    } else {
      throw new Error('DiAnalytics: trackingApiKey must not empty string!');
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
      this.getInstance().exitScreen(name, properties)
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

  static notifyUsingCookies(title: string, message: string, allowLabel: string, declineLabel: string): void {
    NotifyUsingCookies.showBanner()
  }

  static reset(): DiAnalytics {
    this.getInstance().reset();
    return this;
  }
}


