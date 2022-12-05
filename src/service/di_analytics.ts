import {CustomerProperties, Properties, SystemEvents} from '../domain';
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
    productUrl?: string,
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
      product_url: productUrl,
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
    productUrl: string,
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
      product_url: productUrl,
      variation_id: variationId,
      variation_title: variationTitle,
      vendor: vendor,
      source: source,
      ...properties
    });
  }

  static async checkout(
    productId: string,
    quantity: number,
    currency: string,
    totalPrice: number,
    productIds: string[],
    productTitles: string[],
    variantIds: string[],
    vendorNames: string[],
    url: string,
    properties?: Properties
  ): Promise<void> {
    await this.track(SystemEvents.Checkout, {
      product_id: productId,
      quantity: quantity,
      currency: currency,
      total_price: totalPrice,
      product_ids: productIds,
      product_titles: productTitles,
      variant_ids: variantIds,
      vendor_names: vendorNames,
      url: url,
      ...properties
    });
  }

  static async cancelOrder(checkoutId: string, reason: string, properties?: Properties): Promise<void> {
    await this.track(SystemEvents.CancelOrder, {
      checkout_id: checkoutId,
      reason: reason,
      ...properties
    });
  }

  static async returnOrder(checkoutId: string, reason: string, properties?: Properties): Promise<void> {
    await this.track(SystemEvents.ReturnOrder, {
      checkout_id: checkoutId,
      reason: reason,
      ...properties
    });
  }

  static notifyUsingCookies(title: string, message: string, allowLabel: string, declineLabel: string): void {
    NotifyUsingCookies.showBanner();
  }

  static reset(): DiAnalytics {
    this.getInstance().reset();
    return this;
  }
}


