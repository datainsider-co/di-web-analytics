import {Properties} from '../domain';
import {DataManager} from '../misc/data_manager';
import {AnalyticsCore} from './analytics_core';

export class DiAnalytics {
  private static instance: AnalyticsCore;

  private static getInstance(): AnalyticsCore {
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

  //TODO: Clear additional data & queue... etc
  static init(trackingApiKey: string, properties?: Properties) {
    this.instance = this.createDiAnalytics(trackingApiKey, properties);

  }

  private static createDiAnalytics(trackingApiKey: string, properties?: Properties): AnalyticsCore {
    if (trackingApiKey && trackingApiKey.length !== 0) {
      DataManager.setTrackingApiKey(trackingApiKey);
      return new AnalyticsCore(trackingApiKey, properties || {});
    } else {
      throw new Error('DiAnalytics: trackingApiKey must not empty string!');
    }
  }

  static autoTrackDom(cssSelector: string) {

  }

  static enterScreenStart(name: string) {
    this.getInstance().touchSession();
    this.getInstance().enterScreenStart(name);
  }

  static enterScreen(name: string, properties: Properties = {}): DiAnalytics {
    this.getInstance().touchSession();
    this.getInstance().enterScreen(name, properties);
    return this;
  }

  static exitScreen(name: string, properties: Properties = {}): DiAnalytics {
    this.getInstance().touchSession();
    this.getInstance().exitScreen(name, properties);
    return this;
  }

  static register(properties: Properties): DiAnalytics {
    this.getInstance().touchSession();
    this.getInstance().register(properties);
    return this;
  }

  static time(event: string): DiAnalytics {
    this.getInstance().touchSession();
    this.getInstance().time(event);
    return this;
  }

  static async track(event: string, properties: Properties = {}) {
    this.getInstance().touchSession();
    return this.getInstance().track(event, properties);
  }

  static async setUserProfile(userId: string, properties: Properties = {}) {
    this.getInstance().touchSession();
    return this.getInstance().setUserProfile(userId, properties);
  }

  static reset(): DiAnalytics {
    this.getInstance().reset();
    return this;
  }
}


