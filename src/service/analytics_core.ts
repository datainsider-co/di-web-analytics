import {CustomerProperties, EventProperties, Properties} from '../domain';
import {DataManager} from '../misc/data_manager';
import LibConfig from '../domain/config';
import AnalyticsUtils from '../misc/analytics_utils';
import {Stopwatch, StopwatchFactory} from '../misc/event_stopwatch';
import {PersistentQueue} from '../misc/persistent_queue';
import {EventColumnIds, SystemEvents} from '../domain/system_events';
import {TrackingSessionManager} from '../misc/tracking_session_manager';
import {TrackingSessionInfo} from '../domain/tracking_session_info';
import {Mutex} from 'async-mutex';
import { v4 as uuidv4 } from 'uuid';


export abstract class BaseAnalyticsCore {

  abstract reset(): void

  abstract getTrackingId(): Promise<string>

  abstract setGlobalConfig(properties: Properties): void

  abstract enterScreenStart(name: string): void

  abstract enterScreen(name: string, userProps?: Properties): void

  abstract exitScreen(name: string, userProps?: Properties): void

  abstract touchSession(): Promise<any>

  abstract time(event: string): void

  abstract identify(userId: string): void

  abstract setUserProfile(userId: string, properties: CustomerProperties): Promise<any>

  abstract track(event: string, properties: Properties | EventProperties): void
}

export class DisableAnalyticsCore extends BaseAnalyticsCore {

  constructor() {
    super();
  }

  enterScreen(name: string, userProps?: Properties): void {
  }

  enterScreenStart(name: string): void {
  }

  exitScreen(name: string, userProps?: Properties): void {
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

  track(event: string, properties: Properties): void {
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
  private readonly worker: PersistentQueue = new PersistentQueue();


  constructor(properties: Properties) {
    super();
    const props = {
      ...DataManager.getGlobalProperties(),
      ...properties
    };
    DataManager.setGlobalProperties(props);
    this.globalProperties = props;
    this.getTrackingId().then(() => this.touchSession());
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
    this.time(SystemEvents.SCREEN_ENTER);
    this.lastScreenName = name || '';
  }

  enterScreen(name: string, userProps: Properties = {}): void {
    this.lastScreenName = name || '';
    this.time(`di_pageview_${name}`);
    const properties = {...userProps};
    properties[EventColumnIds.SCREEN_NAME] = name;
    this.track(SystemEvents.SCREEN_ENTER, properties);
  }

  exitScreen(name: string, userProps: Properties = {}): void {
    const elapseDuration = this.stopwatch.stop(`di_pageview_${name}`);
    const properties = {...userProps};
    properties[EventColumnIds.SCREEN_NAME] = name;
    properties[EventColumnIds.START_TIME] = elapseDuration.startTime || 0;
    properties[EventColumnIds.DURATION] = elapseDuration.duration || 0;
    this.track(SystemEvents.PAGE_VIEW, properties);
  }


  async touchSession(): Promise<any> {
    const releaser = await this.mutex.acquire();
    try {
      const sessionInfo = TrackingSessionManager.getSession();
      if (sessionInfo.isExpired) {
        if (sessionInfo.sessionId) {
          this.endSession(sessionInfo);
        }
        TrackingSessionManager.deleteSession();
        this.createSession();
      } else {
        TrackingSessionManager.updateSession(sessionInfo.sessionId);
      }
    } finally {
      releaser();
    }
  }

  private createSession(): void {
    const properties = this.buildCreateSessionTrackingData();
    this.worker.add(SystemEvents.SESSION_CREATED, properties);
  }

  private endSession(sessionInfo: TrackingSessionInfo): void {
    let properties = this.buildEndSessionTrackingData(sessionInfo);
    return this.track(SystemEvents.SESSION_END, properties);
  }

  time(event: string) {
    this.stopwatch.start(event);
  }

  //TODO: Send an event to server to resolve old events with this user id
  identify(userId: string) {
    const oldUserId = DataManager.getUserId();
    if (oldUserId && oldUserId.length !== 0 && oldUserId !== userId) {
      DataManager.reset();
    }
    DataManager.setUserId(userId);
  }

  setUserProfile(customerId: string, properties: CustomerProperties): Promise<void> {
    DataManager.setUserId(customerId);
    const customerProperties: CustomerProperties = {
      ...properties,
      di_customer_id: customerId
    };
    return this.worker.add(SystemEvents.SET_USER, customerProperties);
  }

  track(event: string, properties: Properties): void {
    const eventProperties: EventProperties = this.buildEventProperties(event, properties);
    this.worker.add(event, properties);
  }

  /**
   *
   * @private
   */
  private buildCreateSessionTrackingData(): Properties {
    const properties = this.buildEventProperties(SystemEvents.SESSION_CREATED, {});
    const [sessionId, createdAt, _] = TrackingSessionManager.createSession(properties);
    properties[EventColumnIds.SESSION_ID] = sessionId;
    properties[EventColumnIds.START_TIME] = createdAt;
    properties[EventColumnIds.TIME] = createdAt;
    return properties;
  }

  /**
   * Build session tracking data from given session info
   * @param sessionInfo
   * @private
   */
  private buildEndSessionTrackingData(sessionInfo: TrackingSessionInfo): Properties {
    const properties = sessionInfo.properties || {};
    properties[EventColumnIds.SESSION_ID] = sessionInfo.sessionId;
    properties[EventColumnIds.START_TIME] = sessionInfo.createdAt;
    properties[EventColumnIds.DURATION] = (Date.now() - sessionInfo.createdAt);
    properties[EventColumnIds.TIME] = Date.now();
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
