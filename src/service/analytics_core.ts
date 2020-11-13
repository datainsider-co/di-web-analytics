import { Properties } from '../domain';
import { DataManager } from '../misc/data_manager';
import { trackingService } from './tracking_service';
import LibConfig from '../domain/config';
import AnalyticsUtils from '../misc/analytics_utils';
import { EventStopWatch } from '../misc/event_stopwatch';
import { PersistentQueue } from '../misc/persistent_queue';
import { EventColumnIds, SystemEvents } from '../domain/system_events';
import { TrackingSessionManager } from "../misc/tracking_session_manager";
import { TrackingSessionInfo } from "../domain/tracking_session_info";
import { Mutex } from 'async-mutex';

export class AnalyticsCore {
  private readonly mutex = new Mutex();

  private trackingApiKey: string;
  private globalProperties: Properties;

  private lastScreenName?: string;

  private readonly stopWatch: EventStopWatch = new EventStopWatch();
  private readonly worker: PersistentQueue = new PersistentQueue();


  constructor(trackingApiKey: string, properties: Properties) {
    this.trackingApiKey = trackingApiKey;
    let props = {
      ...DataManager.getGlobalProperties(),
      ...properties
    };
    DataManager.setGlobalProperties(props);
    this.globalProperties = props;
    this.getTrackingId().then(() => {
      this.touchSession();
    });
    this.setupAndStartWorker();
  }

  private setupAndStartWorker() {

    document.addEventListener('readystatechange', event => {
      if (document.readyState === 'complete') {
        window.addEventListener('unload', (event) => {
          this.touchSession();
          this.worker.stop();
        });
      }
    });
  }

  reset() {
    this.lastScreenName = '';
    this.stopWatch.clear();
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

  enterScreen(name: string, userProps: Properties = {}): Promise<any> {
    this.lastScreenName = name || '';
    this.time(`di_pageview_${name}`);
    const properties = { ...userProps };
    properties[EventColumnIds.SCREEN_NAME] = name;
    return this.track(SystemEvents.SCREEN_ENTER, properties);
  }

  exitScreen(name: string, userProps: Properties = {}): Promise<any> {
    let [startTime, duration] = this.stopWatch.stopAndPop(`di_pageview_${name}`);
    const properties = { ...userProps };
    properties[EventColumnIds.SCREEN_NAME] = name;
    properties[EventColumnIds.START_TIME] = startTime || 0;
    properties[EventColumnIds.DURATION] = duration || 0;
    return this.track(SystemEvents.PAGE_VIEW, properties);
  }


  time(event: string) {
    this.stopWatch.add(event);
  }

  track(event: string, properties: Properties): Promise<any> {
    const eventProperties = this.buildTrackingProperties(event, properties);
    return this.trackEvent(event, eventProperties);
  }

  private trackEvent(event: string, properties: Properties): Promise<any> {
    return this.worker.enqueueEvent(this.trackingApiKey, event, properties);
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


  async touchSession(): Promise<any> {
    const releaser = await this.mutex.acquire();
    try {
      const sessionInfo = TrackingSessionManager.getSession();
      if (sessionInfo.isExpired) {
        if (sessionInfo.sessionId) {
          await this.endSession(sessionInfo);
        }
        await this.createSession();
      } else {
        TrackingSessionManager.updateSession(sessionInfo.sessionId);
      }
    } finally {
      releaser();
    }
  }

  private createSession(): Promise<any> {
    const properties = this.buildTrackingProperties(SystemEvents.SESSION_CREATED, {})
    const [sessionId, createdAt, _] = TrackingSessionManager.createSession(properties);
    properties[EventColumnIds.SESSION_ID] = sessionId;
    properties[EventColumnIds.TIME] = createdAt;
    return this.trackEvent(SystemEvents.SESSION_CREATED, properties);
  }


  private endSession(sessionInfo: TrackingSessionInfo): Promise<any> {
    let properties = sessionInfo.properties || {};
    properties[EventColumnIds.SESSION_ID] = sessionInfo.sessionId;
    properties[EventColumnIds.START_TIME] = sessionInfo.createdAt;
    properties[EventColumnIds.DURATION] = (Date.now() - sessionInfo.createdAt);
    return this.track(SystemEvents.SESSION_END, properties);
  }


  private buildTrackingProperties(event: string, properties: Properties): Properties {
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
    let [startTime, duration] = this.stopWatch.stopAndPop(event);
    if (!properties[EventColumnIds.START_TIME]) {
      properties[EventColumnIds.START_TIME] = startTime || 0;
    }
    if (!properties[EventColumnIds.DURATION]) {
      properties[EventColumnIds.DURATION] = duration || 0;
    }

  }


}
