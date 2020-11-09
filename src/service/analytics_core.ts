import { Properties } from '../domain';
import { DataManager } from './data_manager';
import { trackingService } from './di_tracking.service';
import LibConfig from '../domain/config';
import AnalyticsUtils from '../analytics_utils';
import { EventStopWatch } from '../misc/event_stopwatch';
import { PersistentQueue } from '../misc/persistent_queue';
import { SystemEvents, EventColumnIds } from '../domain/system_events';

export class AnalyticsCore {
  private trackingApiKey: string;
  private globalProperties: Properties;

  private lastScreenName?: string;

  private readonly stopWatch: EventStopWatch = new EventStopWatch();
  private readonly worker: PersistentQueue = new PersistentQueue();


  constructor(trackingApiKey: string, properties: Properties) {
    this.trackingApiKey = trackingApiKey;
    let props = {
      ...DataManager.getGlobalPropertes(),
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

        this.worker.start();

        document.addEventListener('unload', (event) => {
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

  async register(properties: Properties) {
    let props = {
      ...this.globalProperties,
      ...properties
    };
    DataManager.setGlobalProperties(props);
    this.globalProperties = props;
  }

  async enterScreenStart(name: string) {
    this.time(SystemEvents.SCREEN_ENTER);
    this.lastScreenName = name || '';
  }

  async enterScreen(name: string, properties: Properties = {}) {
    this.time(`di_pageview_${name}`);
    properties[EventColumnIds.SCREEN_NAME] = name;
    this.lastScreenName = name || '';
    return this.track(SystemEvents.SCREEN_ENTER, properties);
  }

  async exitScreen(name: string, properties: Properties = {}) {
    let [startTime, duration] = this.stopWatch.stopAndPop(`di_pageview_${name}`);

    properties[EventColumnIds.SCREEN_NAME] = name;
    properties[EventColumnIds.START_TIME] = startTime || 0;
    properties[EventColumnIds.DURATION] = duration || 0;
    this.lastScreenName = '';
    return this.track(SystemEvents.PAGE_VIEW, properties);
  }

  trackSessionCreated(sessionId: string, createdAt: number) {
    let properties = {} as Properties;
    properties[EventColumnIds.SESSION_ID] = sessionId;
    properties[EventColumnIds.TIME] = createdAt;
    return this.track(SystemEvents.SESSION_CREATED, properties);
  }

  trackSessionEnd(sessionId: string, createdAt: number) {
    let properties = {} as Properties;
    properties[EventColumnIds.SESSION_ID] = sessionId;
    properties[EventColumnIds.START_TIME] = createdAt;
    properties[EventColumnIds.DURATION] = (Date.now() - createdAt);
    return this.track(SystemEvents.SESSION_END, properties);
  }

  time(event: string) {
    this.stopWatch.add(event);
  }

  track(event: string, properties: Properties) {
    const eventProperties = this.buildTrackingProperties(event, properties);
    this.worker.enqueueEvent(this.trackingApiKey, event, eventProperties);
  }

  //TODO: Send an event to server to resolve and old event with this user id
  identify(userId: string) {
    const oldUserId = DataManager.getUserId();
    if (oldUserId && oldUserId.length !== 0 && oldUserId !== userId) {
      DataManager.reset();
    }
    DataManager.setUserId(userId);
  }

  setUserProfile(userId: string, properties: Properties): void {
    DataManager.setUserId(userId);
    this.worker.enqueueEngage(this.trackingApiKey, userId, properties);
  }


  touchSession(): void {
    const [sessionId, isExpired, createdAt, _] = DataManager.getSession();
    if (isExpired) {
      if (!sessionId) {
        this.trackSessionEnd(sessionId, createdAt);
      }
      this.createSession();
    } else {
      DataManager.updateSession(sessionId);
    }
  }

  private createSession() {
    const [sessionId, createdAt, _] = DataManager.createSession();
    this.trackSessionCreated(sessionId, createdAt);
  }


  private buildTrackingProperties(event: string, properties: Properties): Properties {
    const trackingId = DataManager.getTrackingId();
    const [sessionId, _] = DataManager.getSession();
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
    result[EventColumnIds.SESSION_ID] = sessionId || properties[EventColumnIds.SESSION_ID] || '';
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
