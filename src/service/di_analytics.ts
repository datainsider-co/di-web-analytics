import {
  AddToCartProperties,
  CancelOrderProperties,
  CheckoutProperties,
  CustomerProperties,
  ProductProperties,
  Properties,
  RemoveFromCartProperties,
  ReturnOrderProperties,
  SearchProperties,
  SystemEvents,
  ViewProductProperties
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

  static async viewProduct(properties: ViewProductProperties): Promise<void> {
    return this.track(SystemEvents.ViewProduct, properties);
  }

  static async search(properties: SearchProperties): Promise<void> {
    return this.track(SystemEvents.Search, properties);
  }

  static async addToCart(properties: AddToCartProperties): Promise<void> {
    return this.track(SystemEvents.AddToCart, properties);
  }

  static async removeFromCart(properties: RemoveFromCartProperties): Promise<void> {
    await this.track(SystemEvents.RemoveFromCart, properties);
  }

  static async checkout(checkoutProperties: CheckoutProperties, customer?: CustomerProperties, products?: ProductProperties[]): Promise<void> {
    await this.track(SystemEvents.Checkout, checkoutProperties);
    if (customer) {
      await this.track(SystemEvents.AddCustomer, customer);
    }
    // if (products) {
    //   for (const product of products) {
    //     await this.track(SystemEvents.ViewProduct, product);
    //   }
    // }
  }

  static async cancelOrder(properties: CancelOrderProperties): Promise<void> {
    await this.track(SystemEvents.CancelOrder, properties);
  }

  static async returnOrder(properties: ReturnOrderProperties): Promise<void> {
    await this.track(SystemEvents.ReturnOrder, properties);
  }

  static notifyUsingCookies(title: string, message: string, allowLabel: string, declineLabel: string): void {
    NotifyUsingCookies.showBanner();
  }

  static reset(): DiAnalytics {
    this.getInstance().reset();
    return this;
  }
}


