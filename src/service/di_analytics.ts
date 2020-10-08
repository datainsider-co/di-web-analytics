import { Properties } from '../domain';
import { DataManager } from './data_manager';
import { trackingService } from './di_tracking.service';
import LibConfig from '../domain/config';




export class DiAnalytics {
  private static instance: DiAnalyticsLib;

  private static getInstance(): DiAnalyticsLib {
    if (!this.instance) {
      const trackingApiKey = DataManager.getTrackingApiKey();
      if (trackingApiKey) {
        this.init(trackingApiKey);
      } else {
        throw new Error('DiAnalytics: You have to call DiAnalytics.init first.');
      }
    }
    return this.instance;
  }

  private static createDiAnalytics(trackingApiKey: string, properties?: Properties): DiAnalyticsLib {
    if (trackingApiKey && trackingApiKey.length !== 0) {
      DataManager.setTrackingApiKey(trackingApiKey);
      return new DiAnalyticsLib(trackingApiKey, properties || {});
    } else {
      throw new Error('DiAnalytics: trackingApiKey must not empty string!');
    }
  }

  //TODO: Clear additional data & queue... etc
  static init(trackingApiKey: string, properties?: Properties) {
    this.instance = this.createDiAnalytics(trackingApiKey, properties);
  }

  static enterScreen(name: string, properties: Properties = {}): DiAnalytics {
    this.getInstance().enterScreen(name, properties);
    return this;
  }

  static exitScreen(name: string, properties: Properties = {}): DiAnalytics {
    this.getInstance().exitScreen(name, properties);
    return this;
  }

  static reset(): DiAnalytics {
    this.getInstance().reset();
    return this;
  }

  static register(properties: Properties): DiAnalytics {
    this.getInstance().register(properties)
    return this;
  }

  static track(event: string, properties: Properties = {}): DiAnalytics {
    this.getInstance().track(event, properties);
    return this;
  }

  static setUserProfile(userId: string, properties: Properties = {}): DiAnalytics {
    this.getInstance().setUserProfile(userId, properties);
    return this;
  }

}

class DiAnalyticsLib {
  private trackingApiKey: string;
  private globalProperties: Properties;

  constructor(trackingApiKey: string, properties: Properties) {
    this.trackingApiKey = trackingApiKey;

    let props = {
      ...DataManager.getGlobalPropertes(),
      ...properties
    };
    DataManager.setGlobalProperties(props)
    this.globalProperties = props;
  }

  private async getTrackingId(): Promise<string> {
    const generateTrackingId = async (): Promise<string> => {
      return trackingService.genTrackId(this.trackingApiKey).then(trackingId => {
        if (!trackingId) {
          throw Error("Can't generate tracking id");
        }
        DataManager.setTrackingId(trackingId);
        return trackingId;
      });
    }

    let trackId = DataManager.getTrackingId();
    if (!trackId) {
      trackId = await generateTrackingId();
    }
    return trackId;
  }

  private getCurrentPageAndReferrerInfo(): Properties {
    const url = new URL(window.document.URL);
    let currentPageAndReferrerInfo = {
      'di_url': url.href,
      'di_url_params': JSON.stringify(new Map<string,string>(url.searchParams.entries())),
    } as Properties;
    if (window.document.referrer) {
      const referrer = new URL(window.document.referrer);
      currentPageAndReferrerInfo['di_referrer_host'] = referrer.host;
      currentPageAndReferrerInfo['di_referrer'] = referrer.href;
      currentPageAndReferrerInfo['di_referrer_params'] = JSON.stringify(new Map<string,string>(referrer.searchParams.entries()))
    }

    return currentPageAndReferrerInfo;
  }

  private enrichWithGlobalProperties(properties: Properties): Properties {
    return {
      ...this.globalProperties,
      ...properties,
    };
  }

  private enrichWithSystemProperties(trackingId: string, properties: Properties): Properties {
    const userId = DataManager.getUserId();


    if (!properties['di_screen_name']) {
      properties['di_screen_name'] = window.document.location.pathname;
    }
    return {
      ...properties,
      ...this.getCurrentPageAndReferrerInfo(),
      'di_tracking_id': trackingId,
      'di_user_id': userId || '',
      'di_platform': LibConfig.platform,
      'di_lib_version': LibConfig.version,
      'di_start_time': 0,
      'di_duration': 0,
      'di_time': Date.now(),
    };
  }

  reset() {
    DataManager.reset();

  }

  register(properties: Properties) {
    let props = {
      ...this.globalProperties,
      ...properties
    };
    DataManager.setGlobalProperties(props);
    this.globalProperties = props;
  }

  async enterScreen(name: string, properties: Properties = {}) {
    properties["di_screen_name"] = name;
    this.track("di_screen_enter", properties);
  }

  async exitScreen(name: string, properties: Properties = {}) {
    properties["di_screen_name"] = name;
    this.track("di_screen_exit", properties);
  }


  async track(event: string, properties: Properties) {
    return this.getTrackingId().then(trackingId => {
      const eventProperties = this.enrichWithSystemProperties(
        trackingId,
        this.enrichWithGlobalProperties(properties)
      );
      return trackingService.track(this.trackingApiKey, event, eventProperties);
    }).then(maybeTrackingId => {
      if (maybeTrackingId) {
        DataManager.setTrackingId(maybeTrackingId);
      }
    }).catch(ex => console.error('DiAnalytics::track', ex));
  }

  //TODO: Send an event to server to resolve and old event with this user id
  async identify(userId: string): Promise<void> {
    const oldUserId = DataManager.getUserId();
    if (oldUserId && oldUserId.length !== 0 && oldUserId !== userId) {
      DataManager.reset();
    }
    DataManager.setUserId(userId);
  }

  async setUserProfile(userId: string, properties: Properties): Promise<void> {
    DataManager.setUserId(userId);
    return this.getTrackingId().then(trackingId => {
      let props = {
        ...properties,
        'di_tracking_id': trackingId
      };
      return trackingService.engage(this.trackingApiKey, userId, props);
    }).then(maybeTrackId => {
      if (maybeTrackId) {
        DataManager.setTrackingId(maybeTrackId);
      }
    }).catch(ex => console.error('DiAnalytics::setUserProfile', ex));
  }


}

