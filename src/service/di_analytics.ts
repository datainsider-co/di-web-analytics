import {CheckoutProduct, CustomerProperties, EventProperties, Properties, Status, SystemEvents} from '../domain';
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
   * @param queueSize
   * @param flushInterval
   */
  static init(host: string, apiKey: string, properties?: Properties, isDisable?: boolean, queueSize?: number, flushInterval?: number): void {
    if (isDisable ?? false) {
      this.instance = new DisableAnalyticsCore();
    } else {
      LibConfig
      .setValue('apiKey', apiKey)
      .setValue('host', host);
      DataManager.setTrackingHost(host);
      DataManager.setTrackingApiKey(apiKey);
      this.instance = new AnalyticsCore(properties || {}, queueSize, flushInterval);
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

  static async enterScreen(name: string, properties: EventProperties = {}): Promise<void> {
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

  static async track(eventName: string, properties: EventProperties = {}): Promise<any> {
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

  static async viewProduct(id: string, name: string, price: number, source?: string, properties?: Properties): Promise<void> {
    return this.track(SystemEvents.ViewProduct, {
      product_id: id,
      product_name: name,
      product_price: price,
      source: source,
      ...properties
    });
  }

  static async search(query: string, properties?: Properties): Promise<void> {
    return this.track(SystemEvents.Search, {
      query: query,
      ...properties
    });
  }

  static async addToCart(
    url: string,
    currency: string,
    imageUrl: string,
    productPrice: number,
    productId: string,
    productType: string,
    quantity: number,
    productTitle?: string,
    variationId?: string,
    variationTitle?: string,
    vendor?: string,
    source?: string,
    properties?: Properties
  ): Promise<void> {
    return this.track(SystemEvents.AddToCart, {
      url: url,
      currency: currency,
      image_url: imageUrl,
      product_price: productPrice,
      product_id: productId,
      product_type: productType,
      quantity: quantity,
      product_title: productTitle,
      variation_id: variationId,
      variation_title: variationTitle,
      vendor: vendor,
      source: source,
      ...properties
    });
  }

  static async removeFromCart(
    url: string,
    currency: string,
    imageUrl: string,
    productPrice: number,
    productId: string,
    productType: string,
    quantity: number,
    productTitle: string,
    variationId: string,
    variationTitle: string,
    vendor: string,
    source: string,
    properties?: Properties
  ): Promise<void> {
    await this.track(SystemEvents.RemoveFromCart, {
      url: url,
      currency: currency,
      image_url: imageUrl,
      product_price: productPrice,
      product_id: productId,
      product_type: productType,
      quantity: quantity,
      product_title: productTitle,
      variation_id: variationId,
      variation_title: variationTitle,
      vendor: vendor,
      source: source,
      ...properties
    });
  }
  static async trackCheckoutProducts(
    checkoutId: string,
    productList: CheckoutProduct[],
    status: string,
  ): Promise<void> {
    productList.map((product) => {
      return this.track(SystemEvents.CheckoutProduct, {
        checkout_id: checkoutId,
        product_id: product.product_id,
        name: product.title,
        price: product.price,
        quantity: product.quantity,
        status: status,
        ...product.properties
      });
    })

  }

  static async checkout(
    checkoutId: string,
    totalPrice: number,
    url: string,
    productList: CheckoutProduct[],
    properties?: Properties
  ): Promise<void> {
    await this.track(SystemEvents.CheckoutOrder, {
      checkout_id: checkoutId,
      total_price: totalPrice,
      url: url,
      ...properties
    });
    await this.trackCheckoutProducts(checkoutId, productList, Status.Complete);
  }

  static async cancelOrder(checkoutId: string, reason: string, productList: CheckoutProduct[], properties?: Properties): Promise<void> {
    await this.track(SystemEvents.CancelOrder, {
      checkout_id: checkoutId,
      reason: reason,
      ...properties
    });
    await this.trackCheckoutProducts(checkoutId, productList, Status.Cancel);
  }

  static async returnOrder(checkoutId: string, reason: string, productList: CheckoutProduct[], properties?: Properties): Promise<void> {
    await this.track(SystemEvents.ReturnOrder, {
      checkout_id: checkoutId,
      reason: reason,
      ...properties
    });
    await this.trackCheckoutProducts(checkoutId, productList, Status.Return);
  }

  static notifyUsingCookies(title: string, message: string, allowLabel: string, declineLabel: string): void {
    NotifyUsingCookies.showBanner();
  }

  static reset(): DiAnalytics {
    this.getInstance().reset();
    return this;
  }
}


