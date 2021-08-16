import {Properties} from '../domain';
import {DataManager} from '../misc/data_manager';
import {trackingService} from './tracking_service';
import LibConfig from '../domain/config';
import AnalyticsUtils from '../misc/analytics_utils';
import {Stopwatch, StopwatchFactory} from '../misc/event_stopwatch';
import {PersistentQueue} from '../misc/persistent_queue';
import {EventColumnIds, SystemEvents} from '../domain/system_events';
import {TrackingSessionManager} from "../misc/tracking_session_manager";
import {TrackingSessionInfo} from "../domain/tracking_session_info";
import {Mutex} from 'async-mutex';


export abstract class BaseAnalyticsCore {

  abstract reset(): void

  abstract getTrackingId(): Promise<string>

  abstract register(properties: Properties): void

  abstract enterScreenStart(name: string): void

  abstract enterScreen(name: string, userProps?: Properties): void

  abstract exitScreen(name: string, userProps?: Properties): void

  abstract touchSession(): Promise<any>

  abstract time(event: string): void

  abstract identify(userId: string): void

  abstract setUserProfile(userId: string, properties: Properties): Promise<any>

  abstract track(event: string, properties: Properties): void
}

export class NoopAnalyticsCore extends BaseAnalyticsCore {

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
    return Promise.resolve("");
  }

  identify(userId: string): void {
  }

  register(properties: Properties): void {
  }

  reset(): void {
  }

  setUserProfile(userId: string, properties: Properties): Promise<any> {
    return Promise.resolve(undefined);
  }

  time(event: string): void {
  }

  async touchSession(): Promise<any> {
    return Promise.resolve(undefined);
  }

  track(event: string, properties: Properties): void {
  }

}

export class AnalyticsCore extends BaseAnalyticsCore {
  private readonly mutex = new Mutex();

  private readonly trackingApiKey: string;
  private globalProperties: Properties;

  private lastScreenName?: string;

  private readonly stopwatch: Stopwatch = StopwatchFactory.createStopwatch();
  private readonly worker: PersistentQueue = new PersistentQueue();


  constructor(trackingApiKey: string, properties: Properties) {
    super()
    this.trackingApiKey = trackingApiKey;
    let props = {
      ...DataManager.getGlobalProperties(),
      ...properties
    };
    DataManager.setGlobalProperties(props);
    this.globalProperties = props;
    this.getTrackingId().then(() => this.touchSession());
    this.setupAndStartWorker();
  }

  private setupAndStartWorker() {

    document.addEventListener('readystatechange', event => {
      if (document.readyState === 'complete') {
        window.addEventListener('unload', (event) => {
          this.worker.stop();
        });
      }
    });
  }

  reset() {
    this.lastScreenName = '';
    this.stopwatch.clear();
    DataManager.reset();
  }

  async getTrackingId(): Promise<string> {
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

  register(properties: Properties) {
    let props = {
      ...this.globalProperties,
      ...properties
    };
    DataManager.setGlobalProperties(props);
    this.globalProperties = props;
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
    return this.enqueueEventData(SystemEvents.SESSION_CREATED, properties);
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

  setUserProfile(userId: string, properties: Properties) {
    DataManager.setUserId(userId);
    return this.worker.enqueueEngage(this.trackingApiKey, userId, properties);
  }

  track(event: string, properties: Properties): void {
    const eventProperties = this.buildTrackingData(event, properties);
    this.enqueueEventData(event, eventProperties);
  }

  private enqueueEventData(event: string, properties: Properties): void {

    this.worker.enqueueEvent(this.trackingApiKey, event, properties);
  }

  /**
   *
   * @private
   */
  private buildCreateSessionTrackingData(): Properties {
    const properties = this.buildTrackingData(SystemEvents.SESSION_CREATED, {})
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
   * @param properties
   * @private
   */
  private buildTrackingData(event: string, properties: Properties): Properties {
    const trackingId = DataManager.getTrackingId();
    const sessionInfo = TrackingSessionManager.getSession();
    this.enrichScreenName(properties);
    this.enrichDuration(event, properties);

    const result: Properties = {
      ...this.globalProperties,
      ...properties,
      ...AnalyticsUtils.buildClientSpecifications(),
      ...AnalyticsUtils.buildPageAndReferrerInfo(
        properties[EventColumnIds.URL],
        properties[EventColumnIds.REFERRER]
      )
    };

    result[EventColumnIds.LIB_PLATFORM] = LibConfig.platform;
    result[EventColumnIds.LIB_VERSION] = LibConfig.version;
    result[EventColumnIds.SESSION_ID] = sessionInfo.sessionId || properties[EventColumnIds.SESSION_ID] || '';
    result[EventColumnIds.TRACKING_ID] = trackingId || properties[EventColumnIds.TRACKING_ID] || '';
    result[EventColumnIds.USER_ID] = DataManager.getUserId() || '';
    result[EventColumnIds.TIME] = properties[EventColumnIds.TIME] || Date.now();

    return result;
  }

  private enrichScreenName(properties: Properties) {
    if (!properties[EventColumnIds.SCREEN_NAME]) {
      properties[EventColumnIds.SCREEN_NAME] = this.lastScreenName || window.document.location.pathname;
    }
  }

  private enrichDuration(event: string, properties: Properties) {
    const elapseDuration = this.stopwatch.stop(event);
    if (!properties[EventColumnIds.START_TIME]) {
      properties[EventColumnIds.START_TIME] = elapseDuration.startTime || 0;
    }
    if (!properties[EventColumnIds.DURATION]) {
      properties[EventColumnIds.DURATION] = elapseDuration.duration || 0;
    }
  }

}
