import { Properties } from '../domain';
import { DataManager } from './data_manager';
import { trackingService } from './di_tracking.service';
import LibConfig from '../domain/config';
import AnalyticsUtils from '../analytics_utils';
import { EventStopWatch } from './event_stopwatch';

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

  //TODO: Clear additional data & queue... etc
  static init(trackingApiKey: string, properties?: Properties) {
    this.instance = this.createDiAnalytics(trackingApiKey, properties);

  }

  private static createDiAnalytics(trackingApiKey: string, properties?: Properties): DiAnalyticsLib {
    if (trackingApiKey && trackingApiKey.length !== 0) {
      DataManager.setTrackingApiKey(trackingApiKey);
      return new DiAnalyticsLib(trackingApiKey, properties || {});
    } else {
      throw new Error('DiAnalytics: trackingApiKey must not empty string!');
    }
  }

  static reset(): DiAnalytics {
    this.getInstance().reset();
    return this;
  }

  static enterScreenStart(name: string) {
    this.getInstance().enterScreenStart(name);
  }

  static enterScreen(name: string, properties: Properties = {}): DiAnalytics {
    this.getInstance().enterScreen(name, properties);
    return this;
  }

  static exitScreen(name: string, properties: Properties = {}): DiAnalytics {
    this.getInstance().exitScreen(name, properties);
    return this;
  }

  static register(properties: Properties): DiAnalytics {
    this.getInstance().register(properties)
    return this;
  }

  static time(event: string): DiAnalytics {
    this.getInstance().time(event);
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

  private lastScreenName?: string;

  private stopWatch: EventStopWatch = new EventStopWatch();


  constructor(trackingApiKey: string, properties: Properties) {
    this.trackingApiKey = trackingApiKey;

    let props = {
      ...DataManager.getGlobalPropertes(),
      ...properties
    };
    DataManager.setGlobalProperties(props);
    this.globalProperties = props;
    this.touchSession();

    document.addEventListener('beforeunload', (event) => {
      let [sessionId, createdAt, _] = DataManager.getSession();
      if (sessionId && createdAt) {
        this.trackSessionEnd(sessionId, createdAt);
      }
      DataManager.deleteSession();
    })
  }

  reset() {
    this.lastScreenName = '';
    this.stopWatch.clear();
    DataManager.reset();
  }

  async register(properties: Properties) {
    let props = {
      ...this.globalProperties,
      ...properties
    };
    DataManager.setGlobalProperties(props);
    this.globalProperties = props;
    await this.touchSession();
  }

  async enterScreenStart(name: string) {
    this.time('di_screen_enter');
    this.lastScreenName = name || '';
  }

  async enterScreen(name: string, properties: Properties = {}) {
    this.time(`di_pageview_${name}`);
    properties["di_screen_name"] = name;
    this.lastScreenName = name || '';
    return this.track("di_screen_enter", properties);
  }

  async exitScreen(name: string, properties: Properties = {}) {
    let [startTime, duration] = this.stopWatch.stopAndPop(`di_pageview_${name}`);

    properties["di_screen_name"] = name;
    properties["di_start_time"] = startTime || 0;
    properties["di_duration"] = duration || 0;
    this.lastScreenName = '';
    this.track("di_screen_exit", properties);
    return this.track("di_pageview", properties);
  }

  async trackSessionCreated(sessionId: string, createdAt: number) {
    let properties = {} as Properties;
    properties['di_session_id'] = sessionId;
    properties['di_time'] = createdAt;
    return this.track('di_session_created', properties);
  }

  async trackSessionEnd(sessionId: string, createdAt: number) {
    let properties = {} as Properties;
    properties['di_session_id'] = sessionId;
    properties['di_start_time'] = createdAt;
    properties['di_duration'] = Date.now() - createdAt;
    return this.track('di_session_end', properties);
  }

  time(event: string) {
    this.touchSession();
    this.stopWatch.add(event);
  }

  async track(event: string, properties: Properties): Promise<any> {
    await this.touchSession();
    return this.getTrackingId().then(trackingId => {
      const eventProperties = this.buildTrackingProperties(
        event,
        trackingId,
        properties
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
    await this.touchSession();
    const oldUserId = DataManager.getUserId();
    if (oldUserId && oldUserId.length !== 0 && oldUserId !== userId) {
      DataManager.reset();
    }
    DataManager.setUserId(userId);
  }

  async setUserProfile(userId: string, properties: Properties): Promise<void> {
    await this.touchSession();
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


  private async touchSession(): Promise<void> {
    let [sessionId, createdAt, expiredAt] = DataManager.getSession();
    if (!sessionId || (Date.now() >= expiredAt)) {
      this.trackSessionEnd(sessionId, createdAt);
      this.createSession();
    } else {
      DataManager.updateSession(sessionId);
    }
  }

  private createSession() {
    let [sessionId, createdAt, _] = DataManager.createSession();
    this.trackSessionCreated(sessionId, createdAt);
  }


  private buildTrackingProperties(event: string, trackingId: string, properties: Properties): Properties {
    let [sessionId, _] = DataManager.getSession();
    this.enrichScreenName(properties);
    this.enrichDuration(event, properties);
    return {
      ...this.globalProperties,
      ...properties,
      ...AnalyticsUtils.buildClientSpecifications(),
      ...AnalyticsUtils.buildPageAndReferrerInfo(),
      'di_tracking_id': trackingId,
      'di_user_id': DataManager.getUserId() || '',
      'di_lib_platform': LibConfig.platform,
      'di_lib_version': LibConfig.version,
      'di_session_id': sessionId || properties['di_session_id'] || '',
      'di_time': properties['di_time'] || Date.now(),
    };
  }

  private enrichScreenName(properties: Properties) {
    if (!properties['di_screen_name']) {
      properties['di_screen_name'] = this.lastScreenName || window.document.location.pathname;
    }
  }



  private enrichDuration(event: string, properties: Properties) {
    let [startTime, duration] = this.stopWatch.stopAndPop(event);
    if (!properties['di_start_time']) {
      properties['di_start_time'] = startTime || 0;
    }
    if (!properties['di_duration']) {
      properties['di_duration'] = duration || 0;
    }
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

}

