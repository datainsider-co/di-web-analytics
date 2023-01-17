import {CheckoutProduct, CustomerProperties, EventProperties, Properties, Status, SystemEvents} from '../domain';
import {DataManager} from '../misc/data_manager';
import {AnalyticsCore} from './analytics_core';
import {AnalyticsCoreImpl} from './analytics_core_impl';
import {DisableAnalyticsCore} from './disable_analytics_core';
import NotifyUsingCookies from '../misc/notify_using_cookies';
import LibConfig from '../domain/config';
import {Logger, LoggerLevel} from './logger';
import {StorageType} from '../misc';

export class DiAnalytics {
  private static instance: AnalyticsCore;

  static getInstance(): AnalyticsCore {
    if (!this.instance) {
      const host = DataManager.getTrackingHost();
      const apiKey = DataManager.getTrackingApiKey();
      if (host && apiKey) {
        this.init({
          host: host,
          apiKey: apiKey
        });
      } else {
        throw new Error('DiAnalytics: You have to call DiAnalytics.getInstance first.');
      }
    }
    return this.instance;
  }

  /**
   * @param data.host current host for tracking service
   * @param data.apiKey api key for tracking service
   * @param data.properties custom properties for tracking service
   * @param data.isDisable disable tracking service
   * @param data.bufferSize queue size for tracking service
   * @param data.flushInterval interval flush events to server
   * @param data.storageType storage type for cache events
   */
  static init(data: {
    host: string;
    apiKey: string;
    properties?: Properties;
    isDisable?: boolean;
    bufferSize?: number;
    flushInterval?: number;
    storageType?: StorageType
  }): void {
    if (data.isDisable ?? false) {
      this.instance = new DisableAnalyticsCore();
    } else {
      LibConfig
      .setValue('apiKey', data.apiKey)
      .setValue('host', data.host);
      DataManager.setTrackingHost(data.host);
      DataManager.setTrackingApiKey(data.apiKey);
      this.instance = new AnalyticsCoreImpl(data.properties || {}, data.storageType, data.bufferSize, data.flushInterval);
    }
  }

  /**
   * change log level in runtime
   */
  static setLoggerLevel(level: LoggerLevel): DiAnalytics {
    Logger.setLogLevel(level);
    return this;
  }


  static autoTrackDom(cssSelector: string): void {
    throw Error('Not implemented');
  }

  static enterScreenStart(name: string): void {
    try {
      this.getInstance().touchSession();
      this.getInstance().enterScreenStart(name);
    } catch (ex) {
      Logger.error('DiAnalytics.enterScreenStart failed', ex);
    }
  }

  static enterScreen(name: string, properties: EventProperties = {}): void {
    try {
      this.getInstance().touchSession();
      this.getInstance().enterScreen(name, properties);
    } catch (ex) {
      Logger.error('DiAnalytics.enterScreen failed', ex);
    }
  }

  static exitScreen(name: string, properties: Properties = {}): void {
    try {
      this.getInstance().touchSession();
      this.getInstance().exitScreen(name, properties);
    } catch (ex) {
      Logger.error('DiAnalytics.exitScreen failed', ex);
    }
  }

  static setGlobalConfig(properties: Properties): void {
    try {
      this.getInstance().touchSession();
      this.getInstance().setGlobalConfig(properties);
    } catch (ex) {
      Logger.error('DiAnalytics.register failed', ex);
    }
  }

  static time(event: string): DiAnalytics {
    try {
      this.getInstance().touchSession();
      this.getInstance().time(event);
      return this;
    } catch (ex) {
      Logger.error('DiAnalytics.time failed', ex);
      return this;
    }
  }

  static track(eventName: string, properties: EventProperties = {}): void {
    try {
      this.getInstance().touchSession();
      this.getInstance().track(eventName, properties);
    } catch (ex) {
      Logger.error('DiAnalytics.track failed', ex);
    }
  }

  static identify(customerId: string): void {
    try {
      this.getInstance().touchSession();
      this.getInstance().identify(customerId);
    } catch (ex) {
      Logger.error('DiAnalytics.identify failed', ex);
    }
  }

  static setUserProfile(customerId: string, properties: CustomerProperties = {}): void {
    try {
      this.getInstance().touchSession();
      this.getInstance().setUserProfile(customerId, properties);
    } catch (ex) {
      Logger.error('DiAnalytics.setUserProfile failed', ex);
    }
  }

  static viewProduct(id: string, name: string, price: number, source?: string, properties?: Properties): void {
    this.track(SystemEvents.ViewProduct, {
      product_id: id,
      product_name: name,
      product_price: price,
      source: source,
      ...properties
    });
  }

  static search(query: string, properties?: Properties): void {
    this.track(SystemEvents.Search, {
      query: query,
      ...properties
    });
  }

  static register(
    customerInfo: CustomerProperties,
    properties?: Properties
  ): void {
    try {
      this.track(SystemEvents.Register, {
        ...customerInfo,
        ...properties
      });
    } catch (ex) {
      Logger.error('DiAnalytics.register failed', ex);
    }
  }

  static login(
    customerInfo: CustomerProperties,
    properties?: Properties
  ): void {
    try {
      this.identify(customerInfo.di_customer_id!);
      this.track(SystemEvents.Login, {
        ...customerInfo,
        ...properties
      });
    } catch (ex) {
      Logger.error('DiAnalytics.login failed', ex);
    }
  }

  static logout(properties?: Properties): void {
    try {
      this.track(SystemEvents.Logout, properties);
    } catch (ex) {
      Logger.error('DiAnalytics.logout failed', ex);
    }
  }

  static destroySession(): void {
    try {
      this.getInstance().destroySession();
    } catch (ex) {
      Logger.error('DiAnalytics.destroySession failed', ex);
    }
  }

  static addToCart(
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
  ): void {
    this.track(SystemEvents.AddToCart, {
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

  static removeFromCart(
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
  ): void {
    this.track(SystemEvents.RemoveFromCart, {
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

  static trackCheckoutProducts(
    checkoutId: string,
    productList: CheckoutProduct[],
    status: Status
  ): void {
    try {
      this.getInstance().touchSession();
      productList.map((product) => {
        const productProperties = {...product};
        const customProperties = product.properties;
        delete productProperties.properties;
        const productPrice = status === Status.Complete ? product.price : -product.price;
        const totalPrice = productPrice * productProperties.quantity;
        this.getInstance().track(SystemEvents.CheckoutProduct, {
          checkout_id: checkoutId,
          ...productProperties,
          totalPrice: totalPrice,
          status: status,
          ...customProperties
        });
      });
    } catch (ex) {
      Logger.error('DiAnalytics.track failed', ex);
    }


  }

  static checkout(
    checkoutId: string,
    totalPrice: number,
    url: string,
    productList: CheckoutProduct[],
    properties?: Properties
  ): void {
    this.track(SystemEvents.CheckoutOrder, {
      checkout_id: checkoutId,
      total_price: totalPrice,
      url: url,
      ...properties
    });
    this.trackCheckoutProducts(checkoutId, productList, Status.Complete);
  }

  static cancelOrder(checkoutId: string, reason: string, productList: CheckoutProduct[], properties?: Properties): void {
    this.track(SystemEvents.CancelOrder, {
      checkout_id: checkoutId,
      reason: reason,
      ...properties
    });
    this.trackCheckoutProducts(checkoutId, productList, Status.Cancel);
  }

  static returnOrder(checkoutId: string, reason: string, productList: CheckoutProduct[], properties?: Properties): void {
    this.track(SystemEvents.ReturnOrder, {
      checkout_id: checkoutId,
      reason: reason,
      ...properties
    });
    this.trackCheckoutProducts(checkoutId, productList, Status.Return);
  }

  static notifyUsingCookies(title: string, message: string, allowLabel: string, declineLabel: string): void {
    NotifyUsingCookies.showBanner();
  }

  /**
   * @deprecated use destroy destroy session instead
   */
  static reset(): void {
    try {
      this.destroySession();
    } catch (ex) {
      Logger.debug('DiAnalytics.reset failed', ex);
    }
  }
}


