import {
  CustomerProperties,
  ProductProperties,
  ProductPurchaseProperties,
  Properties,
  SearchProperties,
  SystemEvents,
  TransactionProperties
} from '../domain';
import {DataManager} from '../misc/data_manager';
import {AnalyticsCore, BaseAnalyticsCore, DisableAnalyticsCore} from './analytics_core';
import NotifyUsingCookies from '../misc/notify_using_cookies';
import LibConfig from '../domain/config';
import {Logger, LoggerLevel} from './logger';

export class DiAnalytics {
  private static instance: BaseAnalyticsCore;

  private static getInstance(): BaseAnalyticsCore {
    if (!this.instance) {
      const host = DataManager.getTrackingHost();
      const apiKey = DataManager.getTrackingApiKey();
      if (host && apiKey) {
        this.init(host, apiKey);
      } else {
        throw new Error('DiAnalytics: You have to call DiAnalytics.getInstance first.');
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
  static init(host: string, apiKey: string, properties?: Properties, isDisable?: boolean): void {
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

  /**
   * change log level in runtime
   */
  static setLoggerLevel(level: LoggerLevel): DiAnalytics {
    Logger.setLogLevel(level);
    return this;
  }


  static autoTrackDom(cssSelector: string) {
  }

  static async enterScreenStart(name: string): Promise<any> {
    try {
      await this.getInstance().touchSession();
      await this.getInstance().enterScreenStart(name);
    } catch (ex) {
      Logger.error('DiAnalytics.enterScreenStart failed', ex);
    }
  }

  static async enterScreen(name: string, properties: Properties = {}): Promise<void> {
    try {
      await this.getInstance().touchSession();
      await this.getInstance().enterScreen(name, properties);
    } catch (ex) {
      Logger.error('DiAnalytics.enterScreen failed', ex);
    }
  }

  static async exitScreen(name: string, properties: Properties = {}): Promise<void> {
    try {
      await this.getInstance().touchSession();
      await this.getInstance().exitScreen(name, properties);
    } catch (ex) {
      Logger.error('DiAnalytics.exitScreen failed', ex);
    }
  }

  static async setGlobalConfig(properties: Properties): Promise<void> {
    try {
      await this.getInstance().touchSession();
      await this.getInstance().setGlobalConfig(properties);
    } catch (ex) {
      Logger.error('DiAnalytics.register failed', ex);
    }
  }

  static async time(event: string): Promise<DiAnalytics> {
    try {
      await this.getInstance().touchSession();
      await this.getInstance().time(event);
      return this;
    } catch (ex) {
      Logger.error('DiAnalytics.time failed', ex);
      return this;
    }
  }

  static async track(eventName: string, properties: Properties = {}): Promise<any> {
    try {
      await this.getInstance().touchSession();
      await this.getInstance().track(eventName, {
        di_event_name: eventName,
        ...properties
      });
    } catch (ex) {
      Logger.error('DiAnalytics.track failed', ex);
    }
  }

  static async identify(userId: string): Promise<any> {
    try {
      await this.getInstance().touchSession();
      await this.getInstance().identify(userId);
    } catch (ex) {
      Logger.error('DiAnalytics.identify failed', ex);
    }
  }

  static async setUserProfile(userId: string, properties: CustomerProperties = {}): Promise<void> {
    try {
      await this.getInstance().touchSession();
      await this.getInstance().setUserProfile(userId, properties);
    } catch (ex) {
      Logger.error('DiAnalytics.setUserProfile failed', ex);
    }
  }

  static async viewProduct(productId: string, properties: ProductProperties = {}): Promise<void> {
    properties.di_product_id = productId;
    return this.track(SystemEvents.ProductViewed, properties);
  }

  static async searchProduct(properties: SearchProperties = {}): Promise<void> {
    return this.track(SystemEvents.ProductSearched, properties);
  }

  static async addToCart(productId: string, properties: ProductProperties = {}): Promise<void> {
    properties.di_product_id = productId;
    return this.track(SystemEvents.AddToCart, properties);
  }

  static async removeFromCart(productId: string, properties: ProductProperties = {}): Promise<void> {
    properties.di_product_id = productId;
    await this.track(SystemEvents.RemoveFromCart, properties);
  }

  static async startCheckout(transactionId: string, properties: TransactionProperties = {}): Promise<void> {
    properties.di_product_id = transactionId;
    await this.track(SystemEvents.CheckoutStart, properties);
  }

  static async completePurchase(transactionId: string, properties: TransactionProperties = {}): Promise<void> {
    properties.di_transaction_id = transactionId;
    return this.track(SystemEvents.CompletePurchase, properties);
  }

  static async trackProductPurchase(transactionId: string, properties: ProductPurchaseProperties = {}): Promise<void> {
    properties.di_transaction_id = transactionId;
    return this.track(SystemEvents.ProductPurchased, properties);
  }

  static notifyUsingCookies(title: string, message: string, allowLabel: string, declineLabel: string): void {
    NotifyUsingCookies.showBanner();
  }

  static reset(): DiAnalytics {
    this.getInstance().reset();
    return this;
  }
}


