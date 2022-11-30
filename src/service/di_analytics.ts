import {Properties, TransactionProperties} from '../domain';
import { DataManager } from "../misc/data_manager";
import { AnalyticsCore, BaseAnalyticsCore, DisableAnalyticsCore } from "./analytics_core";
import NotifyUsingCookies from '../misc/notify_using_cookies';
import LibConfig from '../domain/config';
import {ProductProperties} from '@/domain/product_properties';

export class DiAnalytics {
  private static instance: BaseAnalyticsCore;

  private static getInstance(): BaseAnalyticsCore {
    if (!this.instance) {
      const host = DataManager.getTrackingHost();
      const apiKey = DataManager.getTrackingApiKey();
      if (host && apiKey) {
        this.init(host, apiKey);
      } else {
        throw new Error("DiAnalytics: You have to call DiAnalytics.getInstance first.");
      }
    }
    return this.instance;
  }

  /**
   * TODO: Clear additional data & queue... etc
   * @param host current host for tracking service
   * @param apiKey
   * @param properties
   * @param isDisable
   */
  static init(host: string, apiKey: string, properties?: Properties, isDisable?: boolean) {
    if (isDisable ?? false) {
      this.instance = new DisableAnalyticsCore();
    } else {
      LibConfig
        .setValue('apiKey', apiKey)
        .setValue('host', host);
      DataManager.setTrackingHost(host);
      DataManager.setTrackingApiKey(apiKey);
      this.instance = new AnalyticsCore(properties || {});
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

  static async trackProduct(productId: string, properties: ProductProperties = {}): Promise<void> {
    try {
      await this.getInstance().touchSession();
      return this.getInstance().trackProduct(productId, properties);
    } catch (ex) {
      console.error(ex);
    }
  }

  static async trackTransaction(transactionId: string, properties: TransactionProperties = {}): Promise<void> {
    try {
      await this.getInstance().touchSession();
      return this.getInstance().trackTransaction(transactionId, properties);
    } catch (ex) {
      console.error(ex);
    }
  }

  static notifyUsingCookies(title: string, message: string, allowLabel: string, declineLabel: string): void {
    NotifyUsingCookies.showBanner()
  }

  static reset(): DiAnalytics {
    this.getInstance().reset();
    return this;
  }
}


