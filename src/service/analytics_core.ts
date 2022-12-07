import {CustomerProperties, EventProperties, Properties} from '../domain';
import {DataManager} from '../misc/data_manager';
import LibConfig from '../domain/config';
import AnalyticsUtils from '../misc/analytics_utils';
import {Stopwatch, StopwatchFactory} from '../misc/event_stopwatch';
import {PersistentQueue} from '../misc/persistent_queue';
import {SystemEvents} from '../domain/system_events';
import {TrackingSessionManager} from '../misc/tracking_session_manager';
import {TrackingSessionInfo} from '../domain/tracking_session_info';
import {Mutex} from 'async-mutex';
import {v4 as uuidv4} from 'uuid';


export abstract class BaseAnalyticsCore {

  abstract reset(): void

  abstract getTrackingId(): Promise<string>

  abstract setGlobalConfig(properties: Properties): void

  abstract enterScreenStart(name: string): void

  abstract enterScreen(name: string, userProps?: EventProperties): Promise<void>

  abstract exitScreen(name: string, userProps?: EventProperties): Promise<void>

  abstract touchSession(): Promise<any>

  abstract time(event: string): void

  abstract identify(userId: string): void

  abstract setUserProfile(userId: string, properties: CustomerProperties): Promise<any>

  abstract track(event: string, properties: Properties | EventProperties): Promise<void>
}

export class DisableAnalyticsCore extends BaseAnalyticsCore {

  constructor() {
    super();
  }

  async enterScreen(name: string, userProps?: EventProperties): Promise<void> {
  }

  enterScreenStart(name: string): void {
  }

  async exitScreen(name: string, userProps?: EventProperties): Promise<void> {
  }

  async getTrackingId(): Promise<string> {
    return Promise.resolve('');
  }

  identify(userId: string): void {
  }

  setGlobalConfig(properties: Properties): void {
  }

  reset(): void {
  }

  time(event: string): void {
  }

  async touchSession(): Promise<any> {
    return Promise.resolve(undefined);
  }

  track(event: string, properties: Properties): Promise<void> {
    return Promise.resolve(undefined);
  }

  setUserProfile(userId: string, properties: CustomerProperties): Promise<any> {
    return Promise.resolve(undefined);
  }
}

export class AnalyticsCore extends BaseAnalyticsCore {
  private readonly mutex = new Mutex();

  // private readonly url: string;
  // private readonly trackingApiKey: string;
  private globalProperties: Properties;

  private lastScreenName?: string;

  private readonly stopwatch: Stopwatch = StopwatchFactory.createStopwatch();
  private readonly worker: PersistentQueue


  constructor(properties: Properties, queueSize?: number, flushInterval?: number) {
    super();
    const props = {
      ...DataManager.getGlobalProperties(),
      ...properties
    };
    DataManager.setGlobalProperties(props);
    this.globalProperties = props;
    this.getTrackingId().then(() => this.touchSession());
    this.worker = new PersistentQueue(queueSize || 1000, flushInterval || 60000);
    this.setupWorker();
  }

  private setupWorker() {

    document.addEventListener('readystatechange', event => {
      window.addEventListener('beforeunload', async (event) => {
        await this.worker.stop();
      });
    });
  }

  reset() {
    this.lastScreenName = '';
    this.stopwatch.clear();
    DataManager.reset();
  }

  async getTrackingId(): Promise<string> {
    return LibConfig.trackingApiKey;
  }

  setGlobalConfig(newProperties: Properties) {
    const finalProperties: Properties = {
      ...this.globalProperties,
      ...newProperties
    };
    DataManager.setGlobalProperties(finalProperties);
    this.globalProperties = finalProperties;
  }

  enterScreenStart(name: string) {
    this.time(SystemEvents.ScreenEnter);
    this.lastScreenName = name || '';
  }

  enterScreen(name: string, properties: EventProperties = {}): Promise<void> {
    this.lastScreenName = name;
    this.time(`di_pageview_${name}`);
    const finalProperties: EventProperties = {
      ...properties,
      di_screen_name: name
    };
    return this.track(SystemEvents.ScreenEnter, finalProperties);
  }

  exitScreen(name: string, properties: EventProperties = {}): Promise<void> {
    const elapseDuration = this.stopwatch.stop(`di_pageview_${name}`);
    const finalProperties: EventProperties = {
      ...properties,
      di_screen_name: name,
      di_start_time: elapseDuration.startTime || 0,
      di_duration: elapseDuration.duration || 0
    };
    this.lastScreenName = '';
    return this.track(SystemEvents.PageView, finalProperties);
  }


  async touchSession(): Promise<any> {
    const releaser = await this.mutex.acquire();
    try {
      const sessionInfo = TrackingSessionManager.getSession();
      if (sessionInfo.isExpired) {
        if (sessionInfo.sessionId) {
          await this.endSession(sessionInfo);
        }
        TrackingSessionManager.deleteSession();
        await this.createSession();
      } else {
        TrackingSessionManager.updateSession(sessionInfo.sessionId);
      }
    } finally {
      releaser();
    }
  }

  private async createSession(): Promise<void> {
    const properties: EventProperties = this.createSessionProperties();
    await this.worker.add(SystemEvents.SessionCreated, properties);
  }

  private endSession(sessionInfo: TrackingSessionInfo): Promise<void> {
    const properties = this.buildEndSessionTrackingData(sessionInfo);
    return this.track(SystemEvents.SessionEnd, properties);
  }

  time(event: string) {
    this.stopwatch.start(event);
  }

  //TODO: Send an event to server to resolve old events with this user id
  identify(customerId: string): void {
    const oldUserId = DataManager.getUserId();
    if (oldUserId && oldUserId.length !== 0 && oldUserId !== customerId) {
      DataManager.reset();
    }
    DataManager.setUserId(customerId);
  }

  setUserProfile(customerId: string, properties: CustomerProperties): Promise<void> {
    DataManager.setUserId(customerId);
    const customerProperties: CustomerProperties = {
      ...properties,
      di_customer_id: customerId
    };
    return this.worker.add(SystemEvents.AddCustomer, customerProperties);
  }

  track(event: string, properties: Properties): Promise<void> {
    const eventProperties: EventProperties = this.buildEventProperties(event, properties);
    return this.worker.add(event, eventProperties);
  }

  /**
   *
   * @private
   */
  private createSessionProperties(): EventProperties {
    const properties = this.buildEventProperties(SystemEvents.SessionCreated, {});
    const [sessionId, createdAt, _] = TrackingSessionManager.createSession(properties);
    properties.di_session_id = sessionId;
    properties.di_start_time = createdAt;
    properties.di_timestamp = createdAt;
    return properties;
  }

  /**
   * Build session tracking data from given session info
   * @param sessionInfo
   * @private
   */
  private buildEndSessionTrackingData(sessionInfo: TrackingSessionInfo): Properties {
    const properties: EventProperties = sessionInfo.properties || {};
    properties.di_session_id = sessionInfo.sessionId;
    properties.di_start_time = sessionInfo.createdAt;
    properties.di_duration = (Date.now() - sessionInfo.createdAt);
    properties.di_timestamp = Date.now();
    return properties;
  }

  /**
   * Build a full tracking tracking data from the given data.
   * @param event
   * @param customProperties
   * @private
   */
  private buildEventProperties(event: string, customProperties: Properties | EventProperties): EventProperties {
    const sessionInfo = TrackingSessionManager.getSession();

    this.enrichScreenName(customProperties);
    this.enrichDuration(event, customProperties);

    const systemProperties: EventProperties = {
      di_event_id: customProperties.di_event_id || uuidv4(),
      di_timestamp: customProperties.di_timestamp || Date.now(),
      di_start_time: customProperties.di_start_time || Date.now(),
      di_customer_id: customProperties.di_customer_id || DataManager.getUserId(),
      di_session_id: customProperties.di_session_id || sessionInfo.sessionId,
      app_version: LibConfig.version,
      app_name: LibConfig.platform,
      ...AnalyticsUtils.buildClientSpecifications(),
      ...AnalyticsUtils.buildPageAndReferrerInfo(
        customProperties.di_url,
        customProperties.di_referrer
      )
    };

    const finalProperties: EventProperties = {
      ...this.globalProperties,
      ...systemProperties,
      ...customProperties
    };
    return finalProperties;
  }

  private enrichScreenName(properties: Properties | EventProperties): void {
    if (!properties.di_screen_name) {
      properties.di_screen_name = this.lastScreenName || window.document.location.pathname;
    }
  }

  private enrichDuration(event: string, properties: Properties | EventProperties) {
    const elapseDuration = this.stopwatch.stop(event);
    if (!properties.di_start_time) {
      properties.di_start_time = elapseDuration.startTime || 0;
    }
    if (!properties.di_duration) {
      properties.di_duration = elapseDuration.duration || 0;
    }
  }
}
